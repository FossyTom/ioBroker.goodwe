/* eslint-disable no-undef */
"use strict";

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const goodWe = require("./GoodWe/GoodWe");

let tmr_timeout = null;

class Goodwe extends utils.Adapter {
	inverter = new goodWe.GoodWeUdp();
	interval;
	cycleCnt = 0;

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "goodwe",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.CreateObjectsDeviceInfo();
		this.CreateObjectsRunningData();
		this.CreateObjectsExtComData();
		this.CreateObjectsBmsInfo();

		// Reset the connection indicator during startup
		this.setState("info.connection", false, true);

		// @ts-ignore
		this.inverter.Connect(this.config.ipAddr, 8899);

		this.myTimer();
		
		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw iobroker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.clearTimeout(tmr_timeout);

			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	CreateObjectsDeviceInfo() {
		this.setObjectNotExistsAsync("DeviceInfo", {
			type: "channel",
			common: { name: "DeviceInfo" },
			native: {},
		});
	
		this.CreateObjectStateNumber("DeviceInfo", "ModbusProtocolVersion");
		this.CreateObjectStateNumber("DeviceInfo", "RatedPower");
		this.CreateObjectStateNumber("DeviceInfo", "AcOutputType");
		this.CreateObjectStateString("DeviceInfo", "SerialNumber");
		this.CreateObjectStateString("DeviceInfo", "DeviceType");
		this.CreateObjectStateNumber("DeviceInfo", "DSP1_SW_Version");
		this.CreateObjectStateNumber("DeviceInfo", "DSP2_SW_Version");
		this.CreateObjectStateNumber("DeviceInfo", "DSP_SVN_Version");
		this.CreateObjectStateNumber("DeviceInfo", "ARM_SW_Version");
		this.CreateObjectStateNumber("DeviceInfo", "ARM_SVN_Version");
		this.CreateObjectStateString("DeviceInfo", "DSP_Int_FW_Version");
		this.CreateObjectStateString("DeviceInfo", "ARM_Int_FW_Version");
	}

	CreateObjectsRunningData() {
		this.setObjectNotExistsAsync("RunningData", {
			type: "channel",
			common: { name: "RunningData" },
			native: {},
		});
	
		this.CreateObjectsDcParameters("RunningData", "PV1");
		this.CreateObjectsDcParameters("RunningData", "PV2");
		this.CreateObjectsDcParameters("RunningData", "PV3");
		this.CreateObjectsDcParameters("RunningData", "PV4");
		this.CreateObjectsAcPhase("RunningData", "GridL1");
		this.CreateObjectsAcPhase("RunningData", "GridL2");
		this.CreateObjectsAcPhase("RunningData", "GridL3");
		this.CreateObjectStateNumber("RunningData", "GridMode");
		this.CreateObjectStateNumber("RunningData", "InverterTotalPower");
		this.CreateObjectStateNumber("RunningData", "AcActivePower");
		this.CreateObjectStateNumber("RunningData", "AcReactivePower");
		this.CreateObjectStateNumber("RunningData", "AcApparentPower");
		this.CreateObjectsPhaseBackUp("RunningData", "BackUpL1");
		this.CreateObjectsPhaseBackUp("RunningData", "BackUpL2");
		this.CreateObjectsPhaseBackUp("RunningData", "BackUpL3");
		this.CreateObjectStateNumber("RunningData", "PowerL1");
		this.CreateObjectStateNumber("RunningData", "PowerL2");
		this.CreateObjectStateNumber("RunningData", "PowerL3");
		this.CreateObjectStateNumber("RunningData", "TotalPowerBackUp");
		this.CreateObjectStateNumber("RunningData", "TotalPower");
		this.CreateObjectStateNumber("RunningData", "UpsLoadPercent");
		this.CreateObjectStateNumber("RunningData", "AirTemperature");
		this.CreateObjectStateNumber("RunningData", "ModulTemperature");
		this.CreateObjectStateNumber("RunningData", "RadiatorTemperature");
		this.CreateObjectStateNumber("RunningData", "FunctionBitValue");
		this.CreateObjectStateNumber("RunningData", "BusVoltage");
		this.CreateObjectStateNumber("RunningData", "NbusVoltage");
		this.CreateObjectsDcParameters("RunningData", "Battery1");
		this.CreateObjectStateNumber("RunningData", "WarningCode");
		this.CreateObjectStateNumber("RunningData", "SaftyCountry");
		this.CreateObjectStateNumber("RunningData", "WorkMode");
		this.CreateObjectStateNumber("RunningData", "OperationMode");
		this.CreateObjectStateNumber("RunningData", "ErrorMessage");
		this.CreateObjectStateNumber("RunningData", "PvEnergyTotal");
		this.CreateObjectStateNumber("RunningData", "PvEnergyDay");
		this.CreateObjectStateNumber("RunningData", "EnergyTotal");
		this.CreateObjectStateNumber("RunningData", "HoursTotal");
		this.CreateObjectStateNumber("RunningData", "EnergyDaySell");
		this.CreateObjectStateNumber("RunningData", "EnergyTotalBuy");
		this.CreateObjectStateNumber("RunningData", "EnergyDayBuy");
		this.CreateObjectStateNumber("RunningData", "EnergyTotalLoad");
		this.CreateObjectStateNumber("RunningData", "EnergyDayLoad");
		this.CreateObjectStateNumber("RunningData", "EnergyBatteryCharge");
		this.CreateObjectStateNumber("RunningData", "EnergyDayCharge");
		this.CreateObjectStateNumber("RunningData", "EnergyBatteryDischarge");
		this.CreateObjectStateNumber("RunningData", "EnergyDayDischarge");
		this.CreateObjectStateNumber("RunningData", "BatteryStrings");
		this.CreateObjectStateNumber("RunningData", "CpldWarningCode");
		this.CreateObjectStateNumber("RunningData", "WChargeCtrFlag");
		//this.CreateObjectStateNumber("RunningData", "DerateFlag");
		this.CreateObjectStateNumber("RunningData", "DerateFrozenPower");
		this.CreateObjectStateNumber("RunningData", "DiagStatusH");
		this.CreateObjectStateNumber("RunningData", "DiagStatusL");
		this.CreateObjectStateNumber("RunningData", "TotalPowerPv");
	}
	
	CreateObjectsExtComData() {
		this.setObjectNotExistsAsync("ExtComData", {
			type: "channel",
			common: { name: "ExtComData" },
			native: {},
		});
	
		this.CreateObjectStateNumber("ExtComData", "Commode");
		this.CreateObjectStateNumber("ExtComData", "Rssi");
		this.CreateObjectStateNumber("ExtComData", "ManufacturerCode");
		this.CreateObjectStateNumber("ExtComData", "MeterConnectStatus");
		this.CreateObjectStateNumber("ExtComData", "MeterCommunicateStatus");
		this.CreateObjectMeterPhase("ExtComData", "L1");
		this.CreateObjectMeterPhase("ExtComData", "L2");
		this.CreateObjectMeterPhase("ExtComData", "L3");
		this.CreateObjectStateNumber("ExtComData", "TotalActivePower");
		this.CreateObjectStateNumber("ExtComData", "TotalReactivePower");
		this.CreateObjectStateNumber("ExtComData", "PowerFactor");
		this.CreateObjectStateNumber("ExtComData", "Frequency");
		this.CreateObjectStateNumber("ExtComData", "EnergyTotalSell");
		this.CreateObjectStateNumber("ExtComData", "EnergyTotalBuy");
	}
	
	CreateObjectsBmsInfo() {
		this.setObjectNotExistsAsync("BMSInfo", {
			type: "channel",
			common: { name: "ExtComData" },
			native: {},
		});
	
		this.CreateObjectStateNumber("BMSInfo", "Status");
		this.CreateObjectStateNumber("BMSInfo", "PackTemperature");
		this.CreateObjectStateNumber("BMSInfo", "CurrentMaxCharge");
		this.CreateObjectStateNumber("BMSInfo", "CurrentMaxDischarge");
		this.CreateObjectStateNumber("BMSInfo", "ErrorCode");
		this.CreateObjectStateNumber("BMSInfo", "SOC");
		this.CreateObjectStateNumber("BMSInfo", "SOH");
		this.CreateObjectStateNumber("BMSInfo", "BatteryStrings");
	}

	CreateObjectStateNumber(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "state",
			common: {
				name: Name,
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	}
	
	CreateObjectStateString(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "state",
			common: {
				name: "Name",
				type: "string",
				role: "text",
				read: true,
				write: false,
			},
			native: {},
		});
	}

	CreateObjectsDcParameters(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: "Name" },
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Voltage", {
			type: "state",
			common: {
				name: "Voltage",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Current", {
			type: "state",
			common: {
				name: "Current",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Power", {
			type: "state",
			common: {
				name: "Power",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Mode", {
			type: "state",
			common: {
				name: "Mode",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	}
	
	CreateObjectsAcPhase(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: "Name" },
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Voltage", {
			type: "state",
			common: {
				name: "Voltage",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Current", {
			type: "state",
			common: {
				name: "Current",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Frequency", {
			type: "state",
			common: {
				name: "Frequency",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Power", {
			type: "state",
			common: {
				name: "Power",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	}
	
	CreateObjectsPhaseBackUp(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: "Name" },
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Voltage", {
			type: "state",
			common: {
				name: "Voltage",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Current", {
			type: "state",
			common: {
				name: "Current",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Frequency", {
			type: "state",
			common: {
				name: "Frequency",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Power", {
			type: "state",
			common: {
				name: "Power",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".Mode", {
			type: "state",
			common: {
				name: "Mode",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	}
	
	CreateObjectMeterPhase(Path, Name) {
		this.setObjectNotExistsAsync(Path + "." + Name, {
			type: "channel",
			common: { name: Name },
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".ActivePower", {
			type: "state",
			common: {
				name: "ActivePower",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	
		this.setObjectNotExistsAsync(Path + "." + Name + ".PowerFactor", {
			type: "state",
			common: {
				name: "PowerFactor",
				type: "number",
				role: "value",
				read: true,
				write: false,
			},
			native: {},
		});
	}

	UpdateDeviceInfo() {
		this.inverter.ReadDeviceInfo();
	
		this.setStateAsync("DeviceInfo.ModbusProtocolVersion", this.inverter.DeviceInfo.ModbusProtocolVersion, true);
		this.setStateAsync("DeviceInfo.RatedPower", this.inverter.DeviceInfo.RatedPower, true);
		this.setStateAsync("DeviceInfo.AcOutputType", this.inverter.DeviceInfo.AcOutputType, true);
		this.setStateAsync("DeviceInfo.SerialNumber", this.inverter.DeviceInfo.SerialNumber, true);
		this.setStateAsync("DeviceInfo.DeviceType", this.inverter.DeviceInfo.DeviceType, true);
		this.setStateAsync("DeviceInfo.DSP1_SW_Version", this.inverter.DeviceInfo.DSP1_SoftwareVersion, true);
		this.setStateAsync("DeviceInfo.DSP2_SW_Version", this.inverter.DeviceInfo.DSP2_SoftwareVersion, true);
		this.setStateAsync("DeviceInfo.DSP_SVN_Version", this.inverter.DeviceInfo.DSP_SVN_Version, true);
		this.setStateAsync("DeviceInfo.ARM_SW_Version", this.inverter.DeviceInfo.ARM_SoftwareVersion, true);
		this.setStateAsync("DeviceInfo.ARM_SVN_Version", this.inverter.DeviceInfo.ARM_SVN_Version, true);
		this.setStateAsync("DeviceInfo.DSP_Int_FW_Version", this.inverter.DeviceInfo.DSP_IntFirmwareVersion, true);
		this.setStateAsync("DeviceInfo.ARM_Int_FW_Version", this.inverter.DeviceInfo.ARM_IntFirmwareVersion, true);
	
		this.setStateAsync("info.connection", this.inverter.Status, true);
	}

	UpdateRunningData() {
		this.inverter.ReadRunningData();
	
		this.setStateAsync("RunningData.PV1.Voltage", this.inverter.RunningData.Pv1.Voltage, true);
		this.setStateAsync("RunningData.PV1.Current", this.inverter.RunningData.Pv1.Current, true);
		this.setStateAsync("RunningData.PV1.Power", this.inverter.RunningData.Pv1.Power, true);
		this.setStateAsync("RunningData.PV1.Mode", this.inverter.RunningData.Pv1.Mode, true);
		this.setStateAsync("RunningData.PV2.Voltage", this.inverter.RunningData.Pv2.Voltage, true);
		this.setStateAsync("RunningData.PV2.Current", this.inverter.RunningData.Pv2.Current, true);
		this.setStateAsync("RunningData.PV2.Power", this.inverter.RunningData.Pv2.Power, true);
		this.setStateAsync("RunningData.PV2.Mode", this.inverter.RunningData.Pv2.Mode, true);
		this.setStateAsync("RunningData.PV3.Voltage", this.inverter.RunningData.Pv3.Voltage, true);
		this.setStateAsync("RunningData.PV3.Current", this.inverter.RunningData.Pv3.Current, true);
		this.setStateAsync("RunningData.PV3.Power", this.inverter.RunningData.Pv3.Power, true);
		this.setStateAsync("RunningData.PV3.Mode", this.inverter.RunningData.Pv3.Mode, true);
		this.setStateAsync("RunningData.PV4.Voltage", this.inverter.RunningData.Pv4.Voltage, true);
		this.setStateAsync("RunningData.PV4.Current", this.inverter.RunningData.Pv4.Current, true);
		this.setStateAsync("RunningData.PV4.Power", this.inverter.RunningData.Pv4.Power, true);
		this.setStateAsync("RunningData.PV4.Mode", this.inverter.RunningData.Pv4.Mode, true);
		this.setStateAsync("RunningData.PV1.Voltage", this.inverter.RunningData.Pv1.Voltage, true);
		this.setStateAsync("RunningData.PV1.Current", this.inverter.RunningData.Pv1.Current, true);
		this.setStateAsync("RunningData.PV1.Power", this.inverter.RunningData.Pv1.Power, true);
		this.setStateAsync("RunningData.GridL1.Voltage", this.inverter.RunningData.GridL1.Voltage, true);
		this.setStateAsync("RunningData.GridL1.Current", this.inverter.RunningData.GridL1.Current, true);
		this.setStateAsync("RunningData.GridL1.Frequency", this.inverter.RunningData.GridL1.Frequency, true);
		this.setStateAsync("RunningData.GridL1.Power", this.inverter.RunningData.GridL1.Power, true);
		this.setStateAsync("RunningData.GridL2.Voltage", this.inverter.RunningData.GridL2.Voltage, true);
		this.setStateAsync("RunningData.GridL2.Current", this.inverter.RunningData.GridL2.Current, true);
		this.setStateAsync("RunningData.GridL2.Frequency", this.inverter.RunningData.GridL2.Frequency, true);
		this.setStateAsync("RunningData.GridL2.Power", this.inverter.RunningData.GridL2.Power, true);
		this.setStateAsync("RunningData.GridL3.Voltage", this.inverter.RunningData.GridL3.Voltage, true);
		this.setStateAsync("RunningData.GridL3.Current", this.inverter.RunningData.GridL3.Current, true);
		this.setStateAsync("RunningData.GridL3.Frequency", this.inverter.RunningData.GridL3.Frequency, true);
		this.setStateAsync("RunningData.GridL3.Power", this.inverter.RunningData.GridL3.Power, true);
		this.setStateAsync("RunningData.GridMode", this.inverter.RunningData.GridMode, true);
		this.setStateAsync("RunningData.InverterTotalPower", this.inverter.RunningData.InverterTotalPower, true);
		this.setStateAsync("RunningData.AcActivePower", this.inverter.RunningData.AcActivePower, true);
		this.setStateAsync("RunningData.AcReactivePower", this.inverter.RunningData.AcReactivePower, true);
		this.setStateAsync("RunningData.AcApparentPower", this.inverter.RunningData.AcApparentPower, true);
		this.setStateAsync("RunningData.BackUpL1.Voltage", this.inverter.RunningData.BackUpL1.Voltage, true);
		this.setStateAsync("RunningData.BackUpL1.Current", this.inverter.RunningData.BackUpL1.Current, true);
		this.setStateAsync("RunningData.BackUpL1.Frequency", this.inverter.RunningData.BackUpL1.Frequency, true);
		this.setStateAsync("RunningData.BackUpL1.Power", this.inverter.RunningData.BackUpL1.Power, true);
		this.setStateAsync("RunningData.BackUpL1.Mode", this.inverter.RunningData.BackUpL1.Mode, true);
		this.setStateAsync("RunningData.BackUpL2.Voltage", this.inverter.RunningData.BackUpL2.Voltage, true);
		this.setStateAsync("RunningData.BackUpL2.Current", this.inverter.RunningData.BackUpL2.Current, true);
		this.setStateAsync("RunningData.BackUpL2.Frequency", this.inverter.RunningData.BackUpL2.Frequency, true);
		this.setStateAsync("RunningData.BackUpL2.Power", this.inverter.RunningData.BackUpL2.Power, true);
		this.setStateAsync("RunningData.BackUpL2.Mode", this.inverter.RunningData.BackUpL2.Mode, true);
		this.setStateAsync("RunningData.BackUpL3.Voltage", this.inverter.RunningData.BackUpL3.Voltage, true);
		this.setStateAsync("RunningData.BackUpL3.Current", this.inverter.RunningData.BackUpL3.Current, true);
		this.setStateAsync("RunningData.BackUpL3.Frequency", this.inverter.RunningData.BackUpL3.Frequency, true);
		this.setStateAsync("RunningData.BackUpL3.Power", this.inverter.RunningData.BackUpL3.Power, true);
		this.setStateAsync("RunningData.BackUpL3.Mode", this.inverter.RunningData.BackUpL3.Mode, true);
		this.setStateAsync("RunningData.PowerL1", this.inverter.RunningData.PowerL1, true);
		this.setStateAsync("RunningData.PowerL2", this.inverter.RunningData.PowerL2, true);
		this.setStateAsync("RunningData.PowerL3", this.inverter.RunningData.PowerL3, true);
		this.setStateAsync("RunningData.TotalPowerBackUp", this.inverter.RunningData.TotalPowerBackUp, true);
		this.setStateAsync("RunningData.TotalPower", this.inverter.RunningData.TotalPower, true);
		this.setStateAsync("RunningData.UpsLoadPercent", this.inverter.RunningData.UpsLoadPercent, true);
		this.setStateAsync("RunningData.AirTemperature", this.inverter.RunningData.AirTemperature, true);
		this.setStateAsync("RunningData.ModulTemperature", this.inverter.RunningData.ModulTemperature, true);
		this.setStateAsync("RunningData.RadiatorTemperature", this.inverter.RunningData.RadiatorTemperature, true);
		this.setStateAsync("RunningData.FunctionBitValue", this.inverter.RunningData.FunctionBitValue, true);
		this.setStateAsync("RunningData.BusVoltage", this.inverter.RunningData.BusVoltage, true);
		this.setStateAsync("RunningData.NbusVoltage", this.inverter.RunningData.NbusVoltage, true);
		this.setStateAsync("RunningData.Battery1.Voltage", this.inverter.RunningData.Battery1.Voltage, true);
		this.setStateAsync("RunningData.Battery1.Current", this.inverter.RunningData.Battery1.Current, true);
		this.setStateAsync("RunningData.Battery1.Power", this.inverter.RunningData.Battery1.Power, true);
		this.setStateAsync("RunningData.Battery1.Mode", this.inverter.RunningData.Battery1.Mode, true);
		this.setStateAsync("RunningData.WarningCode", this.inverter.RunningData.WarningCode, true);
		this.setStateAsync("RunningData.SaftyCountry", this.inverter.RunningData.SaftyCountry, true);
		this.setStateAsync("RunningData.WorkMode", this.inverter.RunningData.WorkMode, true);
		this.setStateAsync("RunningData.OperationMode", this.inverter.RunningData.OperationMode, true);
		this.setStateAsync("RunningData.ErrorMessage", this.inverter.RunningData.ErrorMessage, true);
		this.setStateAsync("RunningData.PvEnergyTotal", this.inverter.RunningData.PvEnergyTotal, true);
		this.setStateAsync("RunningData.PvEnergyDay", this.inverter.RunningData.PvEnergyDay, true);
		this.setStateAsync("RunningData.EnergyTotal", this.inverter.RunningData.EnergyTotal, true);
		this.setStateAsync("RunningData.HoursTotal", this.inverter.RunningData.HoursTotal, true);
		this.setStateAsync("RunningData.EnergyDaySell", this.inverter.RunningData.EnergyDaySell, true);
		this.setStateAsync("RunningData.EnergyTotalBuy", this.inverter.RunningData.EnergyTotalBuy, true);
		this.setStateAsync("RunningData.EnergyDayBuy", this.inverter.RunningData.EnergyDayBuy, true);
		this.setStateAsync("RunningData.EnergyTotalLoad", this.inverter.RunningData.EnergyTotalLoad, true);
		this.setStateAsync("RunningData.EnergyDayLoad", this.inverter.RunningData.EnergyDayLoad, true);
		this.setStateAsync("RunningData.EnergyBatteryCharge", this.inverter.RunningData.EnergyBatteryCharge, true);
		this.setStateAsync("RunningData.EnergyDayCharge", this.inverter.RunningData.EnergyDayCharge, true);
		this.setStateAsync("RunningData.EnergyBatteryDischarge", this.inverter.RunningData.EnergyBatteryDischarge, true);
		this.setStateAsync("RunningData.EnergyDayDischarge", this.inverter.RunningData.EnergyDayDischarge, true);
		this.setStateAsync("RunningData.BatteryStrings", this.inverter.RunningData.BatteryStrings, true);
		this.setStateAsync("RunningData.CpldWarningCode", this.inverter.RunningData.CpldWarningCode, true);
		this.setStateAsync("RunningData.WChargeCtrFlag", this.inverter.RunningData.WChargeCtrFlag, true);
		//this.setStateAsync("RunningData.DerateFlag", this.inverter.RunningData.DerateFlag, true);
		this.setStateAsync("RunningData.DerateFrozenPower", this.inverter.RunningData.DerateFrozenPower, true);
		this.setStateAsync("RunningData.DiagStatusH", this.inverter.RunningData.DiagStatusH, true);
		this.setStateAsync("RunningData.DiagStatusL", this.inverter.RunningData.DiagStatusL, true);
		this.setStateAsync("RunningData.TotalPowerPv", this.inverter.RunningData.TotalPowerPv, true);
	}
	
	UpdateExtComData() {
		this.inverter.ReadExtComData();
	
		this.setStateAsync("ExtComData.Commode", this.inverter.ExtComData.Commode, true);
		this.setStateAsync("ExtComData.Rssi", this.inverter.ExtComData.Rssi, true);
		this.setStateAsync("ExtComData.ManufacturerCode", this.inverter.ExtComData.ManufacturerCode, true);
		this.setStateAsync("ExtComData.MeterConnectStatus", this.inverter.ExtComData.MeterConnectStatus, true);
		this.setStateAsync("ExtComData.MeterCommunicateStatus", this.inverter.ExtComData.MeterCommunicateStatus, true);
		this.setStateAsync("ExtComData.L1.ActivePower", this.inverter.ExtComData.L1.ActivePower, true);
		this.setStateAsync("ExtComData.L1.PowerFactor", this.inverter.ExtComData.L1.PowerFactor, true);
		this.setStateAsync("ExtComData.L2.ActivePower", this.inverter.ExtComData.L2.ActivePower, true);
		this.setStateAsync("ExtComData.L2.PowerFactor", this.inverter.ExtComData.L2.PowerFactor, true);
		this.setStateAsync("ExtComData.L3.ActivePower", this.inverter.ExtComData.L3.ActivePower, true);
		this.setStateAsync("ExtComData.L3.PowerFactor", this.inverter.ExtComData.L3.PowerFactor, true);
		this.setStateAsync("ExtComData.TotalActivePower", this.inverter.ExtComData.TotalActivePower, true);
		this.setStateAsync("ExtComData.TotalReactivePower", this.inverter.ExtComData.TotalReactivePower, true);
		this.setStateAsync("ExtComData.PowerFactor", this.inverter.ExtComData.PowerFactor, true);
		this.setStateAsync("ExtComData.Frequency", this.inverter.ExtComData.Frequency, true);
		this.setStateAsync("ExtComData.EnergyTotalSell", this.inverter.ExtComData.EnergyTotalSell, true);
		this.setStateAsync("ExtComData.EnergyTotalBuy", this.inverter.ExtComData.EnergyTotalBuy, true);
	}
	
	UpdateBmsInfo() {
		this.inverter.ReadBmsInfo();
	
		this.setStateAsync("BMSInfo.Status", this.inverter.BmsInfo.Status, true);
		this.setStateAsync("BMSInfo.PackTemperature", this.inverter.BmsInfo.PackTemperature, true);
		this.setStateAsync("BMSInfo.CurrentMaxCharge", this.inverter.BmsInfo.CurrentMaxCharge, true);
		this.setStateAsync("BMSInfo.CurrentMaxDischarge", this.inverter.BmsInfo.CurrentMaxDischarge, true);
		this.setStateAsync("BMSInfo.ErrorCode", this.inverter.BmsInfo.ErrorCode, true);
		this.setStateAsync("BMSInfo.SOC", this.inverter.BmsInfo.SOC, true);
		this.setStateAsync("BMSInfo.SOH", this.inverter.BmsInfo.SOH, true);
		this.setStateAsync("BMSInfo.BatteryStrings", this.inverter.BmsInfo.BatteryStrings, true);
	}

	myTimer() {	
		if (this.inverter.Status == false) {
			this.cycleCnt = 0;
			this.inverter.ReadIdInfo();
		} else {
		
			switch (this.cycleCnt) {
				case 1:
					this.UpdateDeviceInfo();
					//this.log.info("Goodwe update");
					break;

				case 3:
					this.UpdateRunningData();
					break;

				case 5:
					this.UpdateExtComData();
					break;

				case 7:
					this.UpdateBmsInfo();
					break;
			}

			// @ts-ignore
			if(this.cycleCnt >= this.config.pollCycle) {
				this.cycleCnt = 0;
			}
		
			this.cycleCnt++;
		}

		tmr_timeout = this.setTimeout(() => this.myTimer(), 1000);
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Goodwe(options);
} else {
	// otherwise start the instance directly
	new Goodwe();
}