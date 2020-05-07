package main

import (
	"bytes"
	"compress/zlib"
	"encoding/json"
	"fmt"
	"time"

	"gopkg.in/zeromq/goczmq.v4"
)

type EDDN struct {
	SchemaRef string          `json:"$schemaRef"`
	Header    EDDNHeader      `json:"header"`
	Message   json.RawMessage `json:"message"`
}
type EDDNHeader struct {
	UploaderID       string    `json:"uploaderID"`
	SoftwareName     string    `json:"softwareName"`
	SoftwareVersion  string    `json:"softwareVersion"`
	GatewayTimestamp time.Time `json:"gatewayTimestamp"`
}
type Commodity3 struct {
	Commodities []Commodity3Commodity `json:"commodities"`
	Horizons    bool                  `json:"horizons"`
	MarketID    int                   `json:"marketId"`
	StationName string                `json:"stationName"`
	SystemName  string                `json:"systemName"`
	Timestamp   time.Time             `json:"timestamp"`
}
type Commodity3Commodity struct {
	BuyPrice      int         `json:"buyPrice"`
	Demand        int         `json:"demand"`
	DemandBracket interface{} `json:"demandBracket"`
	MeanPrice     int         `json:"meanPrice"`
	Name          string      `json:"name"`
	SellPrice     int         `json:"sellPrice"`
	StatusFlags   []string    `json:"statusFlags"`
	Stock         int         `json:"stock"`
	StockBracket  int         `json:"stockBracket"`
}

func main() {
	channel := goczmq.NewSubChanneler("tcp://eddn.edcd.io:9500", "")
	defer channel.Destroy()

	run := true
	for run {
		select {
		case rawMessage, ok := <-channel.RecvChan:
			if !ok {
				run = false
				continue
			}

			message, err := decodeMessage(rawMessage[0])
			if err != nil {
				fmt.Println(err.Error())
				run = false
				continue
			}

			//fmt.Println(message.SchemaRef, message.Header.SoftwareName)

			if message.SchemaRef == "https://eddn.edcd.io/schemas/commodity/3" {
				var commodity Commodity3
				err = json.Unmarshal(message.Message, &commodity)
				if err != nil {
					fmt.Println(err.Error())
					fmt.Println(message.Header.SoftwareName, message.Header.SoftwareVersion, string(message.Message))
					continue
				}

				//fmt.Println(commodity.SystemName, commodity.StationName, commodity.MarketID)
				for _, v := range commodity.Commodities {
					//text := ""
					//if v.SellPrice > v.MeanPrice {
					//	text += "high sell price"
					//}
					//fmt.Println("-", v.Name, v.SellPrice, text, strings.Join(v.StatusFlags, ","))

					if v.Name == "lowtemperaturediamond" && (v.BuyPrice > 1000000 || v.SellPrice > 1000000) {
						fmt.Printf("LTD %s %s %d %d Demand %d [%v]\n", commodity.SystemName, commodity.StationName, v.BuyPrice, v.SellPrice, v.Demand, v.DemandBracket)
					}
				}
			} else if message.SchemaRef == "https://eddn.edcd.io/schemas/journal/1" {
				var a struct {
					Event string
				}
				err = json.Unmarshal(message.Message, &a)
				if err != nil {
					fmt.Println(err.Error())
					fmt.Println(message.Header.SoftwareName, message.Header.SoftwareVersion, string(message.Message))
					continue
				}

				if a.Event == "MarketSell" {
					var b struct {
						MarketID  int
						Type      string
						SellPrice int
					}
					err = json.Unmarshal(message.Message, &a)
					if err != nil {
						fmt.Println(err.Error())
						fmt.Println(message.Header.SoftwareName, message.Header.SoftwareVersion, string(message.Message))
						continue
					}

					if b.Type == "lowtemperaturediamond" && b.SellPrice > 1000000 {
						fmt.Printf("LTD Market:%d %d\n", b.MarketID, b.SellPrice)
					}
				}
			}
		}
	}
}

func decodeMessage(rawMessage []byte) (*EDDN, error) {
	r, err := zlib.NewReader(bytes.NewReader(rawMessage))
	if err != nil {
		return nil, err
	}
	defer r.Close()

	var message EDDN
	err = json.NewDecoder(r).Decode(&message)
	if err != nil {
		return nil, err
	}

	return &message, nil
}
