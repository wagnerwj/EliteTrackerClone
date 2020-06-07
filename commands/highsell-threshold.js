const Guild = require('../database/guild');
const HighSellThreshold = require('../database/highsell-threshold');

module.exports = {
	name: 'highsell-threshold',
	description: `Define the threshold to be notified if price is greater or equal.

**Commodites**:
*Chemicals*:
AgronomicTreatment Explosives HydrogenFuel HydrogenPeroxide LiquidOxygen MineralOil NerveAgents Pesticides RockforthFertiliser SurfaceStabilisers SyntheticReagents Water

*Consumer Items*:
Clothing ConsumerTechnology DomesticAppliances Duradrives EvacuationShelter SurvivalEquipment TrinketsOfFortune

*Foods*:
Algae Animalmeat Coffee Fish FoodCartridges FruitAndVegetables Grain SyntheticMeat Tea

*Industrial Materials*:
CeramicComposites CMMComposite CoolingHoses InsulatingMembrane MetaAlloys NeofabricInsulation Polymers Semiconductors Superconductors

*Legal Drugs*:
BasicNarcotics Beer BootlegLiquor Liquor Tobacco Wine

*Machinery*:
ArticulationMotors AtmosphericExtractors BuildingFabricators CropHarvesters EmergencyPowerCells ExhaustManifold GeologicalEquipment HeatsinkInterlink HeliostaticFurnaces HNShockMount IonDistributor MagneticEmitterCoil MarineSupplies MineralExtractors ModularTerminals PowerConverter PowerGenerators PowerGridAssembly PowerTransferConduits RadiationBaffle ReinforcedMountingPlate SkimerComponents ThermalCoolingUnits WaterPurifiers

*Medicines*:
AdvancedMedicines AgriculturalMedicines BasicMedicines CombatStabilisers Nanomedicines PerformanceEnhancers ProgenitorCells

*Metals*:
Aluminium Beryllium Bismuth Cobalt Copper Gallium Gold Hafnium178 Indium Lanthanum Lithium Osmium Palladium Platinum Praseodymium Samarium Silver Tantalum Thallium Thorium Titanium Uranium

*Minerals*:
Alexandrite Bauxite Benitoite Bertrandite Bromellite Coltan Cryolite Gallite Goslarite Grandidierite Indite Jadeite Lepidolite LithiumHydroxide LowTemperatureDiamond MethaneClathrate MethanolMonohydrateCrystals Moissanite Monazite Musgravite Opal Painite Pyrophyllite Rhodplumsite Rutile Serendibite Taaffeite Uraninite

*Technology*:
AdvancedCatalysers AnimalMonitors AquaponicSystems AutoFabricators BioReducingLichen ComputerComponents DiagnosticSensor HazardousEnvironmentSuits MedicalDiagnosticEquipment MicroControllers MuTomImager Nanobreakers ResonatingSeparators Robotics StructuralRegulators TelemetrySuite TerrainEnrichmentSystems

*Textiles*:
ConductiveFabrics Leather MilitaryGradeFabrics NaturalFabrics SyntheticFabrics

*Waste*:
Biowaste ChemicalWaste Scrap ToxicWaste

*Weapons*:
BattleWeapons Landmines NonLethalWeapons PersonalWeapons ReactiveArmour`,
	guildOnly: true,
	args: true,
	usage: '[commodity] [minimum sell price]',
	admin: true,
	async execute(message, args) {
		if (args.length !== 2 || isNaN(+args[1])) {
			return message.channel.send('wrong arguments');
		}
		const material = args[0].toLowerCase();
		const price = +args[1];

		const guild = await Guild.findOne({ where: { guild_id: message.guild.id } });
		if (!guild) {
			return message.channel.send('error in bot configuration, remove and add the bot again for proper setup');
		}

		if (price > 0) {
			const affectedRows = await HighSellThreshold.update({
				minimum_price: price,
			}, {
				where: {
					guild_id: message.guild.id,
					material: material,
				},
			});
			if (affectedRows > 0) {
				return message.channel.send(`Minimum price ${price.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2)} for ${material} updated`);
			}

			await HighSellThreshold.create({
				guild_id: message.guild.id,
				material: material,
				minimum_price: price,
			});

			return message.channel.send(`Minimum price ${price.toFixed(1).replace(/\d(?=(\d{3})+\.)/g, '$& ').slice(0, -2)} for ${material} set`);
		}
		else {
			await HighSellThreshold.destroy({
				where: {
					guild_id: message.guild.id,
					material: material,
				},
			});

			return message.channel.send(`Deleted ${material}`);
		}
	},
};
