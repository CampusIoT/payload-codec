# -*- coding: utf-8 -*-
from construct import *
from binascii import hexlify,unhexlify
from ZCL_FRAME import *
from WTC_CodecTools import *
# For debug ...
class PrintContext(Construct):
	def _parse(self, stream, context, path):
		print(context)

		
##### Tools #####################################
 
BytesTostrBase64 = BytesTostrBase64(GreedyBytes)




import binascii
class BytesTostrHexClass(Adapter):
	# make specific EndPoint Encoding/Decoding
	
	def _encode(self, obj, context):
		obj_str = bytes.fromhex(obj)
		return obj_str
		
	def _decode(self, obj, context):
		obj_hex = binascii.hexlify(obj).decode()
		return obj_hex
 

BytesTostrHex = BytesTostrHexClass(GreedyBytes)
		
#### Status #####################################################
Status = Enum(Int8ub,
	OK = 0x00,
	MalformedCommand             = 0x80,
	UnsupportedClusterCommand    = 0x81,
	UnsupportedGeneralCommand    = 0x82,
	UnsupportedAttribute         = 0x86,
	InvalidField                 = 0x87,
	InvalidValue                 = 0x88,
	InsufficientSpace            = 0x89,
	UnreportableAttribute        = 0x8c,
	BatchReportNoFreeSlot        = 0xc2,
	BatchReportInvalidTag        = 0xc3,
	BatchReportDuplicateTagLabel = 0xc4,
	BatchReportLabelOutOfRange   = 0xc5,
	default                      = Pass
)

#### DataType ###################################################
DataType = Enum(Int8ub,
	Boolean               = 0x10,
	General8              = 0x08,
	General16             = 0x09,
	General24             = 0x0A,
	General32             = 0x0B,
	General40             = 0x0C,
	General48             = 0x0d,
	Bitmap8               = 0x18,
	Bitmap16              = 0x19,
	UInt8                 = 0x20,
	UInt16                = 0x21,
	UInt24                = 0x22,             
	UInt32                = 0x23,
	Int8                  = 0x28,
	Int16                 = 0x29,
	Int32                 = 0x2B,
	UInt8Enum             = 0x30,
	SinglePrecision       = 0x39,
	CharString            = 0x42,
	ByteString            = 0x41,
	LongByteString        = 0x43,
	StructOrderedSequence = 0x4C,
	default               = Pass
)


DataBatch = Switch(
		this._._._.ClusterID, {
			"SimpleMetering" : 	Switch(
									this._._.AttributeID,{
										"CurrentMetering" :  Switch(this.FieldIndex, {
																							0 : Int24sb,
																							1 : Int24sb,
																							2 : Int16ub,
																							3 : Int16ub,
																							4 : Int16ub
																						}
																						)
									}, default               = Pass
								),
			"Occupancy" :	Switch(
									this._._.AttributeID,{
										"Occupancy" : Flag 
									}, default               = Pass
								),
			"Temperature" : Switch(
									this._._.AttributeID,{
										"MeasuredValue" :  Int16sb
									}, default               = Pass
								),
			"Pressure" :Switch(
									this._._.AttributeID,{
										"MeasuredValue" :  Int16sb
									}, default               = Pass
								),
			"Illuminance" :Switch(
									this._._.AttributeID,{
										"MeasuredValue" :  Int16ub
									}, default               = Pass
								),
			"DifferentialPressure" : Switch(
									this._._.AttributeID,{
										"MeasuredValue" :  Int16sb,
										"MinMeasuredValue" :  Int16sb,
										"MaxMeasuredValue" :  Int16sb
									}, default               = Pass
								),
			"RelativeHumidity" : Switch(
									this._._.AttributeID,{
										"MeasuredValue" :  Int16ub
									}, default               = Pass
								),
			"AnalogInput" : Switch(
									this._._.AttributeID,{
										"PresentValue" :  Float32b
									}, default               = Pass
								),
			"BinaryInput" : Switch(
									this._._.AttributeID,{
										"PresentValue" : Flag,
										"Count" :  Int32ub
									}, default               = Pass
								),
			# "MultiStateOutput" : Switch(
									# this._._.AttributeID,{
										# "PresentValue" : Unsigned 8 bits integer
									# }
								# ),
			"Configuration" : Switch(
									this._._.AttributeID,{
										"NodePowerDescriptor" :  Switch(this.FieldIndex, {
																								0 : Int8ub,
																								1 : Int8ub,
																								2 : Int16ub,
																								3 : Int16ub,
																								4 : Int16ub,
																								5 : Int16ub,
																								6 : Int16ub,
																							}
																							)
									}, default               = Pass
								),
			# "VolumeMeter" : Switch(
									# this._._.AttributeID,{
										# "Volume" : signed int l32
									# }
								# ),
			"EnergyPowerMetering" : Switch(
									this._._.AttributeID,{
										"PresentValues" :  Int32ub
									}, default               = Pass
								),
			"VoltageCurrentMetering" : Switch(
									this._._.AttributeID,{
										"PresentValues" :  Int16ub
									}, default               = Pass
								),
			"Concentration" :	Switch(
									this._._.AttributeID,{
										"MeasuredValue" :  Int16ub,
										"MeasuredValueMean" :  Int16ub,
										"MeasuredValueMin" :  Int16ub,
										"MeasuredValueMax" :  Int16ub,
										
									}, default               = Pass
								),

	},default               = Pass
)


#### Endpoint ###################################################
class EndPointAdapter(Adapter):
	# make specific EndPoint Encoding/Decoding
	
	def _encode(self, obj, context):
		assert ((obj >= 0) and (obj < 32))
		return ( ((obj & 0x07) << 4) | 0x08 | ((obj & 0x18) >> 3) )

		
	def _decode(self, obj, context):
		#we work only on 7 bits 
		return ( ((obj & 0x70) >> 4) | ((obj & 0x03) << 3) ) 

EndPoint = EndPointAdapter(BitsInteger(7))

#Frame Ctrl
FrameCtrl = Embedded(BitStruct(
	"EndPoint" / EndPoint,
	"Report" / Enum(Bit, Standard = 1 , Batch = 0),
 ))

#### Min and Max Field
MinMaxField = BitStruct(
	"Unit" / Enum(Bit, Minutes = 1 , Seconds = 0),
	"Value" / BitsInteger(15) 
 )


#### Command ID #################################################
CommandID = Enum(Int8ub,
	ReadAttribute                      = 0x00,
	ReadAttributeResponse              = 0x01,
	WriteAttributeNoResponse           = 0x05,
	ConfigureReporting                 = 0x06,
	ConfigureReportingResponse         = 0x07,
	ReadReportingConfiguration         = 0x08,
	ReadReportingConfigurationResponse = 0x09,
	ReportAttributes                   = 0x0A,
	ReportAttributesAlarm              = 0x8A,
	ClusterSpecificCommand             = 0x50,
	default                            = Pass
)

#### Cluster ID #################################################
#### TODO: PowerQuality      = 0x8052
ClusterID = Enum(Int16ub,
	Basic             = 0x0000,
	OnOff             = 0x0006,
	SimpleMetering    = 0x0052,
	PowerQuality      = 0x8052,
	Occupancy         = 0x0406,
	Temperature       = 0x0402,
	Pressure          = 0x0403,
	RelativeHumidity  = 0x0405,
	AnalogInput       = 0x000C,
	BinaryInput       = 0x000F,
	Illuminance       = 0x0400,
	MultiStateOutput  = 0x0013,
	Configuration     = 0x0050,
	VolumeMeter       = 0x8002,
	SensO             = 0x8003,
	LoRaWAN           = 0x8004,
	MultiBinaryInput  = 0x8005,
	SerialInterface   = 0x8006, 
	SerialMasterSlave = 0x8007,
	DifferentialPressure = 0x8008,
	MultiMasterSlave  = 0x8009,
	TIC_ICE           = 0x0053,
	TIC_CBE           = 0x0054,
	TIC_CJE           = 0x0055,
	TIC_STD           = 0x0056,
	TIC_PMEPMI        = 0x0057,
	EnergyPowerMetering    = 0x800A,
	VoltageCurrentMetering = 0x800B,
	Concentration     = 0x800C,
	default           = Pass
)


#### Attributes ID/Type (per cluster) ##############################
AttributeID = Switch(
	this._.ClusterID, {
		"Basic": Enum (Int16ub,
			FirmwareVersion     = 0x0002, 
			KernelVersion       = 0x0003,
			Manufacturer        = 0x0004,
			ModelIdentifier     = 0x0005,
			DateCode            = 0x0006,
			LocationDescription = 0x0010,
			ApplicationName     = 0x8001,
			default = Pass
		),
		"OnOff": Enum (Int16ub,
			State	= 0x0000,
			default = Pass
		),
		"SimpleMetering": Enum (Int16ub,
			CurrentMetering     = 0x0000,
			CurrentCalibration  = 0x8000,
			default = Pass
		),
		"PowerQuality": Enum (Int16ub,
			CurrentValues        = 0x0000,
			SagCycleThreshold    = 0x0001,
			SagVoltageThreshold  = 0x0002,
			OverVoltageThreshold = 0x0003,
			default = Pass
		),
		"Occupancy": Enum (Int16ub,
			Occupancy                    = 0x0000,
			OccupancyType                = 0x0001,
			OccupiedToUnoccupiedDelay    = 0x0010,
			UnoccupiedToOccupiedDelay    = 0x0011,
			default = Pass
		),
		"Temperature": Enum (Int16ub,
			MeasuredValue    = 0x0000,
			MinMeasuredValue = 0x0001,
			MaxMeasuredValue = 0x0002,
			default = Pass
		),
		"Pressure": Enum (Int16ub,
			MeasuredValue    = 0x0000,
			MinMeasuredValue = 0x0001,
			MaxMeasuredValue = 0x0002,
			default = Pass
		),
		"DifferentialPressure": Enum (Int16ub,
			MeasuredValue    = 0x0000,
			MinMeasuredValue = 0x0001,
			MaxMeasuredValue = 0x0002,
			MeasurementPeriodAttribute =0x0003,
			SamplePerMeasurementAttribute =0x0004,
			SamplePerConfirmationMeasurementAttribute =0x0005,
			SamplePeriodeAttribute =0x0006,
			MeanMeasuredValueSinceLastReportAttribute =0x0100,
			MinimalMeasuredValueSinceLastReportAttribute =0x0101,
			MaximalMeasuredValueSinceLastReportAttribute =0x0102,
		    default = Pass
		),
		"RelativeHumidity": Enum (Int16ub,
			MeasuredValue    = 0x0000,
			MinMeasuredValue = 0x0001,
			MaxMeasuredValue = 0x0002,
			default = Pass
		),
		"AnalogInput": Enum (Int16ub,
			PresentValue    = 0x0055,
			ApplicationType = 0x0100,
			default = Pass
		),
		"BinaryInput": Enum (Int16ub,
			PresentValue    = 0x0055,
			Polarity        = 0x0054,
			ApplicationType = 0x0100,
			EdgeSelection   = 0x0400,
			DebouncePeriod  = 0x0401,
			Count           = 0x0402,
			default = Pass
		),
		"Illuminance": Enum (Int16ub,
			MeasuredValue    = 0x0000,
			MinMeasuredValue = 0x0101,
			MaxMeasuredValue = 0x0102,
			default = Pass
		),
		"MultiStateOutput": Enum (Int16ub,
			PresentValue    = 0x0055,
			NumberOfStates  = 0x004A,
			ApplicationType = 0x0100,
			default = Pass
		),
		"Configuration": Enum (Int16ub,
			Descriptor          = 0x0004,
			ConfigurationMode   = 0x0005,
			NodePowerDescriptor = 0x0006,
			Action0             = 0xff00,
			Action1             = 0xff01,
			Action2             = 0xff02,
			Action3             = 0xff03,
			Action4             = 0xff04,
			Action5             = 0xff05,
			Action6             = 0xff06,
			Action7             = 0xff07,
			Action8             = 0xff08,
			Action9             = 0xff09,
			default = Pass
		),
		"VolumeMeter": Enum (Int16ub,
			Volume            = 0x0000,
			VolumeDisplayMode = 0x0001,
			MinFlow           = 0x0002,
			MaxFlow           = 0x0003,
			FlowDisplayMode   = 0x0004,
			default = Pass
		),
		"SensO": Enum (Int16ub,
			Status                 = 0x0000,
			CountDownThresholds    = 0x0001,
			InstallationRotation   = 0x0002,
			VolumeRotation         = 0x0003,
			TemperatureMeterFreeze = 0x0004,
			TemperatureMinTxOff    = 0x0005,
			ParametersLeakFlow     = 0x0006,
			default = Pass
		),
		"LoRaWAN": Enum (Int16ub,
			MessageType              = 0x0000,
			NumberOfRetryIfConfirmed = 0x0001,
			ReAssociationParameters  = 0x0002,
			DataRateParameters       = 0x0003,
			ABPDevAddr               = 0x0004,
			OTAAppEUI                = 0x0005,
			default = Pass
		),
		"MultiBinaryInput": Enum (Int16ub,
			PresentValues = 0x0000,
			default = Pass
		),
		"SerialInterface": Enum (Int16ub,
			Speed    = 0x0000,
			DataBits = 0x0001,
			Parity   = 0x0002,
			StopBits = 0x0003,
			default = Pass
		), 
		"SerialMasterSlave": Enum (Int16ub,
			Request         = 0x0000,
			Answer          = 0x0001,
			ApplicationType = 0x0002,
			default = Pass
		),
		"MultiMasterSlave": Enum (Int16ub,
			PresentValue    = 0x0000,
			HeaderOption    = 0x0001,
			default = Pass
		),
		"TIC_ICE": Enum (Int16ub,
			Attribute_0        = 0x0000,
			Attribute_1        = 0x0001,
			Attribute_2        = 0x0002,
			Attribute_virtual_0        = 0x0100,
			Attribute_virtual_1        = 0x0101,
			Attribute_virtual_2        = 0x0102,
			default = Pass
		),
		"TIC_CBE": Enum (Int16ub,
			Attribute_0        = 0x0000,
			Attribute_virtual_0        = 0x0100,
			Attribute_virtual_1        = 0x0200,
			Attribute_virtual_2        = 0x0300,
			Attribute_virtual_3        = 0x0400,
			Attribute_virtual_4        = 0x0500,
			default = Pass
		),
		"TIC_CJE": Enum (Int16ub,
			Attribute_0        = 0x0000,
			Attribute_virtual_0        = 0x0100,
			Attribute_virtual_1        = 0x0200,
			Attribute_virtual_2        = 0x0300,
			Attribute_virtual_3        = 0x0400,
			Attribute_virtual_4        = 0x0500,
			default = Pass
		),
		"TIC_STD": Enum (Int16ub,
			Attribute_0        = 0x0000,
			Attribute_virtual_0        = 0x0100,
			Attribute_virtual_1        = 0x0200,
			Attribute_virtual_2        = 0x0300,
			Attribute_virtual_3        = 0x0400,
			Attribute_virtual_4        = 0x0500,
			default = Pass
		),
		"TIC_PMEPMI": Enum (Int16ub,
			Attribute_0        = 0x0000,
			Attribute_virtual_0        = 0x0100,
			Attribute_virtual_1        = 0x0200,
			Attribute_virtual_2        = 0x0300,
			Attribute_virtual_3        = 0x0400,
			Attribute_virtual_4        = 0x0500,
			default = Pass
		),
		"EnergyPowerMetering": Enum (Int16ub,
			PresentValues        = 0x0000,
			PeriodicityAverage   = 0x0001,
			default = Pass
		),
		"VoltageCurrentMetering": Enum (Int16ub,
			PresentValues        = 0x0000,
			default = Pass
		),
		"Concentration": Enum (Int16ub,
			MeasuredValue     = 0x0000,
			MeasuredValueMean = 0x0100,
			MeasuredValueMin  = 0x0101,
			MeasuredValueMax  = 0x0102,
			Unit           = 0x8004,
			MinNormalLevel = 0x8008,
			default = Pass
		)
	},default = "Bytes" / BytesTostrHex 
) 
###########################################
#################TIC ######################
###########################################

DescHeader = BitStruct(
	"Obsolete" / Enum(Bit, Yes = 1 , No = 0),
	"Report" / Enum(Bit, Standard = 0 , Decale = 1),
	"PresentField" / Enum(Bit, DescVarIndexes = 1 , DescVarBitfield = 0),
	"SizeOf" / BitsInteger(5),
)
 

 
TICDataCBEFromBitfields = Struct(
Embedded ( 	If ( (((this._.BitField[6] & 1<<0) == 1<<0)),Struct("ADIR1"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[6]& 1<<1) == 1<<1)),Struct("ADIR2"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[6]& 1<<2) == 1<<2)),Struct("ADIR3"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[6]& 1<<3) == 1<<3)),Struct("ADCO"/String(13)))),
Embedded ( 	If ( (((this._.BitField[6]& 1<<4) == 1<<4)),Struct("OPTARIF"/String(5)))),
Embedded ( 	If ( (((this._.BitField[6]& 1<<5) == 1<<5)),Struct("ISOUSC"/Int8ub))),
Embedded ( 	If ( (((this._.BitField[6]& 1<<6) == 1<<6)),Struct("BASE"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[6]& 1<<7) == 1<<7)),Struct("HCHC"/Int32ub))),

Embedded ( 	If ( (((this._.BitField[5]& 1<<0) == 1<<0)),Struct("HCHP"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[5]& 1<<1) == 1<<1)),Struct("EJPHN"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[5]& 1<<2) == 1<<2)),Struct("EJPHPM"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[5] & 1<<3)== 1<<3)),Struct("BBRHCJB"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[5] & 1<<4) == 1<<4)),Struct("BBRHPJB"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[5] & 1<<5) == 1<<5)),Struct("BBRHCJW"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[5] & 1<<6) == 1<<6)),Struct("BBRHPJW"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[5] & 1<<7) == 1<<7)),Struct("BBRHCJR"/Int32ub))),

Embedded ( 	If ( (((this._.BitField[4] & 1<<0) == 1<<0)),Struct("BBRHPJR"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[4] & 1<<1) == 1<<1)),Struct("PEJP"/Int8ub))),
Embedded ( 	If ( (((this._.BitField[4] & 1<<2) == 1<<2)),Struct("GAZ"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[4] & 1<<3) == 1<<3)),Struct("AUTRE"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[4] & 1<<4) == 1<<4)),Struct("PTEC"/String(5)))),
Embedded ( 	If ( (((this._.BitField[4] & 1<<5) == 1<<5)),Struct("DEMAIN"/String(5)))),
Embedded ( 	If ( (((this._.BitField[4] & 1<<6) == 1<<6)),Struct("IINST"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[4] & 1<<7) == 1<<7)),Struct("IINST1"/Int16ub))),

Embedded ( 	If ( (((this._.BitField[3] & 1<<0) == 1<<0)),Struct("IINST2"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[3] & 1<<1) == 1<<1)),Struct("IINST3"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[3] & 1<<2) == 1<<2)),Struct("ADPS"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[3] & 1<<3) == 1<<3)),Struct("IMAX"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[3] & 1<<4) == 1<<4)),Struct("IMAX1"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[3] & 1<<5) == 1<<5)),Struct("IMAX2"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[3] & 1<<6) == 1<<6)),Struct("IMAX3"/Int16ub))),
Embedded ( 	If ( (((this._.BitField[3] & 1<<7) == 1<<7)),Struct("PMAX"/Int32ub))),

Embedded ( 	If ( (((this._.BitField[2] & 1<<0) == 1<<0)),Struct("PAPP"/Int32ub))),
Embedded ( 	If ( (((this._.BitField[2] & 1<<1) == 1<<1)),Struct("HHPHC"/String(1)))),
Embedded ( 	If ( (((this._.BitField[2] & 1<<2) == 1<<2)),Struct("MOTDETAT"/String(7)))),
Embedded ( 	If ( (((this._.BitField[2] & 1<<3) == 1<<3)),Struct("PPOT"/String(3)))), 
 )
 
TICFieldList = Struct(
	"DescHeader" / DescHeader,
	Embedded(
		Switch(this.DescHeader.PresentField,{ 
			"DescVarIndexes": Struct("essai"/Int8ub),
			"DescVarBitfield": Struct(
				"BitField" / Int8ub[7],
				Switch( this._._._._.ClusterID ,{
					"TIC_CBE" : Embedded(TICDataCBEFromBitfields) ,
					"TIC_ICE" : Embedded(TICDataCBEFromBitfields) ,
				},	default =   "Bytes" / BytesTostrHex
					
				)
				
			)
			
		})
	),
	
	
	
 )
 
################# ModBus ######################

ModBusAnswer = Struct(
	"SlaveID"  / Int8ub, 
	"FcntID" / Int8ub,
	"DataSize"  / Int8ub,
	"Data" / BytesTostrHexClass(Bytes(this.DataSize))
)

DescModbusHeader = BitStruct(
	"SequenceNb" / BitsInteger(8),
	"FrameNb" / BitsInteger(3),
	"LastFrameNb" / BitsInteger(3),
	"EndPointBitField" / BitsInteger(10)
)

ModbusFieldList = Struct(
	"DescModbusHeader" / DescModbusHeader,
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0001 == 0x0001)), Struct("EndPoint_0" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0002 == 0x0002)), Struct("EndPoint_1" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0004 == 0x0004)), Struct("EndPoint_2" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0008 == 0x0008)), Struct("EndPoint_3" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0010 == 0x0010)), Struct("EndPoint_4" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0020 == 0x0020)), Struct("EndPoint_5" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0040 == 0x0040)), Struct("EndPoint_6" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0080 == 0x0080)), Struct("EndPoint_7" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0100 == 0x0100)), Struct("EndPoint_8" / ModBusAnswer))),
	Embedded ( 	If ( ((this.DescModbusHeader.EndPointBitField & 0x0200 == 0x0200)), Struct("EndPoint_9" / ModBusAnswer)))
)

##########################################

#### Data (According to Attribute Type) ##############################
Data = Switch(
	this.AttributeType, {
		"Boolean"              : Flag,
		"General8"             : Byte,
		"General16"            : Bytes(2),
		"General24"            : Bytes(3),
		"General32"            : Bytes(4),
		"General40"            : Bytes(4),
		"General48"            : 
			Switch(this.AttributeID, {
				"FirmwareVersion" : Struct(
					"Major" / Int8ub,
			        "Minor" / Int8ub,
			        "Revision" / Int8ub,
			        "Build" / Int24ub,
			    )
			},	default =   "Bytes" / BytesTostrHex
				
			),
		"Bitmap8"              : BitStruct("b7" / BitsInteger(1),"b6" / BitsInteger(1),"b5" / BitsInteger(1),"b4" / BitsInteger(1),"b3" / BitsInteger(1),"b2" / BitsInteger(1),"b1" / BitsInteger(1),"b0" / BitsInteger(1)),
		"Bitmap16"             : BitStruct("b15" / BitsInteger(1),"b14" / BitsInteger(1),"b13" / BitsInteger(1),"b12" / BitsInteger(1),"b11" / BitsInteger(1),"b10" / BitsInteger(1),"b9" / BitsInteger(1),"b8" / BitsInteger(1),"b7" / BitsInteger(1),"b6" / BitsInteger(1),"b5" / BitsInteger(1),"b4" / BitsInteger(1),"b3" / BitsInteger(1),"b2" / BitsInteger(1),"b1" / BitsInteger(1),"b0" / BitsInteger(1)),
		"UInt8"                : Int8ub,
		"UInt16"               : Int16ub,
		"UInt24"               : Int24ub,
		"UInt32"               : Int32ub,
		"Int8"                 : Int8sb,
		"Int16"                : Int16sb,
		"Int32"                : Int32sb,
		"UInt8Enum"            : Int8ub,
		"SinglePrecision"               : Float32b,
		"CharString"           : 
			Struct(
			   "Count"  / Int8ub, 
			   "String" / BytesTostrHexClass(Bytes(this.Count))
			 ),
		"ByteString"           : Prefixed(Int8ub, 
			Switch(this.AttributeID, {
				"CurrentMetering" : Struct( 
			        "ActiveEnergy" / Int24sb,
			        "ReactiveEnergy" / Int24sb,
			        "NbMinutes" / Int16ub,
			        "ActivePower" / Int16sb,
			        "ReactivePower" / Int16sb,
			    ),
				"NodePowerDescriptor" : Struct(
			        "CurrentPowerMode" / Enum(Int8ub, ONWhenIdle = 0 , PeriodicallyON = 1, ONOnUserEvent = 2, Other = 3),
			        "AvailablePowerSourceBitField" / Int8ub,
					Embedded ( 	If ( ((this.AvailablePowerSourceBitField & 0x01 == 0x01)), Struct("ConstantVoltage" / Int16ub))),
					Embedded ( 	If ( ((this.AvailablePowerSourceBitField & 0x02 == 0x02)), Struct("RechargeableBatteryVoltage" / Int16ub))),
					Embedded ( 	If ( ((this.AvailablePowerSourceBitField & 0x04 == 0x04)), Struct("DisposableBatteryVoltage" / Int16ub))),
					Embedded ( 	If ( ((this.AvailablePowerSourceBitField & 0x08 == 0x08)), Struct("SolarHarvestingVoltage" / Int16ub))),
					Embedded ( 	If ( ((this.AvailablePowerSourceBitField & 0x10 == 0x10)), Struct("TicHarvestingVoltage" / Int16ub))),
			        "CurrentPowerSource" / Enum(Int8ub, No = 0, Constant = 1 , RechargeableBattery = 2, DisposableBattery = 4, SolarHarvesting = 8, TicHarvesting = 16)
			    ),
				"Attribute_0" : Struct(
			        "TICFieldList" / TICFieldList
			    )
			},	default = Switch(this._.ClusterID, {
						"EnergyPowerMetering" : Struct(
							"PositiveActiveEnergy" / Int32ub, 
							"NegativeActiveEnergy" / Int32ub,
							"PositiveReActiveEnergy" / Int32ub, 
							"NegativeReActiveEnergy" / Int32ub,
							"PositiveActivePower" / Int32ub, 
							"NegativeActivePower" / Int32ub,
							"PositiveReActivePower" / Int32ub, 
							"NegativeReActivePower" / Int32ub
						)
						,
						"VoltageCurrentMetering" : Struct(
							"Vrms (V/10)" / Int16ub, 
							"Irms (A/10)" / Int16ub,
							"Angle (degrees)" / Int16ub
						)
						,
						"MultiMasterSlave" : Switch(this._.CommandID, {
								"ReportAttributes" : 					
								Struct(
									"ModbusFieldList" / ModbusFieldList	
									),
								"ReportAttributesAlarm" : 					
									Struct(
									"ModbusFieldList" / ModbusFieldList	
									)
							}, default = Struct(
								"Bytes" / BytesTostrHex
							)
						)
						,
						"SerialMasterSlave" : Switch(this._.CommandID, {
								"ReportAttributes" : 					
								Struct(
									"ModBusAnswer" / ModBusAnswer	
									),
								"ReportAttributesAlarm" : 					
									Struct(
									"ModBusAnswer" / ModBusAnswer	
									)
							}, default = Struct(
								"Bytes" / BytesTostrHex
							)
						)
					}
					, default = Struct(
						"Bytes" / BytesTostrHex
					)
			)
		)
		),
		"LongByteString"       : Prefixed(Int16ub, Struct(
			                       "Bytes" / BytesTostrHex
			                     )),
		"StructOrderedSequence": BytesTostrHex
	},default = "Bytes" / BytesTostrHex
)



#### TagValue ##############################


TagValue = BitStruct(
	"TagLabel" / BitsInteger(5),
	"TagSize" / BitsInteger(3)
)

########################################################
###### Cause CAUSE #####################################
########################################################

ifBatch2 = Struct( 
									"AttributeID" / AttributeID,
									"FieldIndex" / Int8ub,
									"MinReport" / MinMaxField,
									"MaxReport" / MinMaxField,
									"Delta" / DataBatch,
									"Resolution" / DataBatch,
									"TagValue" / TagValue
)
class BatchSizeAdapter(Adapter):
	# revert the size in configure batch cause we swapped it
	
	def _encode(self, obj, context):
		return ( 
			(obj&0x01)<<5 | (obj&0x02)<<3 | (obj&0x04)<<1 |
			(obj&0x08)>>1 | (obj&0x10)>>3 | (obj&0x20)>>5 ) 

		
	def _decode(self, obj, context):
		return ( 
			(obj&0x01)<<5 | (obj&0x02)<<3 | (obj&0x04)<<1 |
			(obj&0x08)>>1 | (obj&0x10)>>3 | (obj&0x20)>>5 ) 


BatchSize = BatchSizeAdapter(BitsInteger(6))

ReportParameters = BitsSwapped(BitStruct(
		"Batch" / Enum(Bit, Yes = 1 , No = 0),
		Embedded(
			IfThenElse(this.Batch == "Yes",
				Struct(
					"Size"	/BatchSize,
					"New" / Enum(Bit, Yes = 1 , No = 0)
				),
				Struct(
					"NoHeaderPort" / Enum(Bit, Yes = 1 , No = 0),
					"Secured" / Enum(Bit, Yes = 1 , No = 0),
					"SecuredIfAlarm" / Enum(Bit, Yes = 1 , No = 0),
					"CauseRequest" / Enum(BitsInteger(2), No = 0, Long = 1, Short = 2),
					"Reserved" / Bit,
					"New" / Enum(Bit, Yes = 1 , No = 0)
				)
			)
		)
	)
)
 
CriteriaSlotDescriptor = BitStruct(
	"Alarm" / Enum(Bit, Yes = 1 , No = 0),
	"OnExceed" / Enum(Bit, Yes = 1 , No = 0),
	"OnFall" / Enum(Bit, Yes = 1 , No = 0),
	"Mode" / Enum(BitsInteger(2), Unused = 0, Delta = 1, Threshold = 2, ThresholdWithActions = 3),
	"CriterionIndex" / BitsInteger(3)
)
Occurence = BitStruct(
	"ExtendedOccurences" / Enum(Bit, No = 0 , Yes = 1),
	Embedded (
	Switch(this.ExtendedOccurences,{ 
		"No" : Struct("Occurences" / BitsInteger(7)),
		"Yes" : Struct(
			"Reserved" / BitsInteger(7),
			"OccurencesHigh" / BitsInteger(16),
			"OccurencesLow" / BitsInteger(16),
			),
	})
	)
)

#########DECODAGE CAUSE REPORT ###############


DataCauseN3 = Switch(
	this._._._.AttributeType, {
		"Boolean"              : Flag,
		"General8"             : Byte,
		"General16"            : Bytes(2),
		"General24"            : Bytes(3),
		"General32"            : Bytes(4),
		"General40"            : Bytes(4),
		"General48"            : Bytes(4),
		"Bitmap8"              : BitStruct("b7" / BitsInteger(1),"b6" / BitsInteger(1),"b5" / BitsInteger(1),"b4" / BitsInteger(1),"b3" / BitsInteger(1),"b2" / BitsInteger(1),"b1" / BitsInteger(1),"b0" / BitsInteger(1)),
		"Bitmap16"             : BitStruct("b15" / BitsInteger(1),"b14" / BitsInteger(1),"b13" / BitsInteger(1),"b12" / BitsInteger(1),"b11" / BitsInteger(1),"b10" / BitsInteger(1),"b9" / BitsInteger(1),"b8" / BitsInteger(1),"b7" / BitsInteger(1),"b6" / BitsInteger(1),"b5" / BitsInteger(1),"b4" / BitsInteger(1),"b3" / BitsInteger(1),"b2" / BitsInteger(1),"b1" / BitsInteger(1),"b0" / BitsInteger(1)),
		"UInt8"                : Int8ub,
		"UInt16"               : Int16ub,
		"UInt32"               : Int32ub,
		"Int8"                 : Int8sb,
		"Int16"                : Int16sb,
		"Int32"                : Int32sb,
		"UInt8Enum"            : Int8ub,
		"SinglePrecision"      : Float32b,
		"ByteString"           : 	Switch(this._._._.AttributeID, {
										"CurrentMetering" : 
											Switch(this.FieldIndex, {
												0 : Int24sb,
												1 : Int24sb,
												2 : Int16ub,
												3 : Int16ub,
												4 : Int16ub
											}
											)
										
										
										,
										"NodePowerDescriptor" : 
											Switch(this.FieldIndex, {
												0 : Int8ub,
												1 : Int8ub,
												2 : Int16ub,
												3 : Int16ub,
												4 : Int16ub,
												5 : Int16ub,
												6 : Int16ub,
											}
											)
										,
									
									},

									default = Switch(this._._._._.ClusterID, {
										"EnergyPowerMetering" : Int32ub ,
										"VoltageCurrentMetering" : Int16ub
										}	)	
									)
			

	},default = "Bytes" / BytesTostrHex
)


DataCauseN3_FieldIndexN1 = Switch(
	this._._._._.AttributeType, {
		"Boolean"              : Flag,
		"General8"             : Byte,
		"General16"            : Bytes(2),
		"General24"            : Bytes(3),
		"General32"            : Bytes(4),
		"General40"            : Bytes(4),
		"General48"            : Bytes(4),
		"Bitmap8"              : BitStruct("b7" / BitsInteger(1),"b6" / BitsInteger(1),"b5" / BitsInteger(1),"b4" / BitsInteger(1),"b3" / BitsInteger(1),"b2" / BitsInteger(1),"b1" / BitsInteger(1),"b0" / BitsInteger(1)),
		"Bitmap16"             : BitStruct("b15" / BitsInteger(1),"b14" / BitsInteger(1),"b13" / BitsInteger(1),"b12" / BitsInteger(1),"b11" / BitsInteger(1),"b10" / BitsInteger(1),"b9" / BitsInteger(1),"b8" / BitsInteger(1),"b7" / BitsInteger(1),"b6" / BitsInteger(1),"b5" / BitsInteger(1),"b4" / BitsInteger(1),"b3" / BitsInteger(1),"b2" / BitsInteger(1),"b1" / BitsInteger(1),"b0" / BitsInteger(1)),
		"UInt8"                : Int8ub,
		"UInt16"               : Int16ub,
		"UInt32"               : Int32ub,
		"Int8"                 : Int8sb,
		"Int16"                : Int16sb,
		"Int32"                : Int32sb,
		"UInt8Enum"            : Int8ub,
		"SinglePrecision"      : Float32b,
		"ByteString"           : 	Switch(this._._._._.AttributeID, {
										"CurrentMetering" : 
											Switch(this._.FieldIndex, {
												0 : Int24sb,
												1 : Int24sb,
												2 : Int16ub,
												3 : Int16ub,
												4 : Int16ub
											}
											)
										
										
										,
										"NodePowerDescriptor" : 
											Switch(this._.FieldIndex, {
												0 : Int8ub,
												1 : Int8ub,
												2 : Int16ub,
												3 : Int16ub,
												4 : Int16ub,
												5 : Int16ub,
												6 : Int16ub,
											}
											)
									},

									default = Switch(this._._._._._.ClusterID, {
										"EnergyPowerMetering" : Int32ub ,
										"VoltageCurrentMetering" : Int16ub
										}	)								
									
									)
									

			
									
			

	},default = "Bytes" / BytesTostrHex
)

DataCauseN4_FieldIndexN2 = Switch(
		this._._._._.AttributeType, {
		"Boolean"              : Flag,
		"General8"             : Byte,
		"General16"            : Bytes(2),
		"General24"            : Bytes(3),
		"General32"            : Bytes(4),
		"General40"            : Bytes(4),
		"General48"            : Bytes(4),
		"Bitmap8"              : BitStruct("b7" / BitsInteger(1),"b6" / BitsInteger(1),"b5" / BitsInteger(1),"b4" / BitsInteger(1),"b3" / BitsInteger(1),"b2" / BitsInteger(1),"b1" / BitsInteger(1),"b0" / BitsInteger(1)),
		"Bitmap16"             : BitStruct("b15" / BitsInteger(1),"b14" / BitsInteger(1),"b13" / BitsInteger(1),"b12" / BitsInteger(1),"b11" / BitsInteger(1),"b10" / BitsInteger(1),"b9" / BitsInteger(1),"b8" / BitsInteger(1),"b7" / BitsInteger(1),"b6" / BitsInteger(1),"b5" / BitsInteger(1),"b4" / BitsInteger(1),"b3" / BitsInteger(1),"b2" / BitsInteger(1),"b1" / BitsInteger(1),"b0" / BitsInteger(1)),
		"UInt8"                : Int8ub,
		"UInt16"               : Int16ub,
		"UInt32"               : Int32ub,
		"Int8"                 : Int8sb,
		"Int16"                : Int16sb,
		"Int32"                : Int32sb,
		"UInt8Enum"            : Int8ub,
		"SinglePrecision"      : Float32b,
		"ByteString"           : 	Switch(this._._._._._.AttributeID, {
										"CurrentMetering" : 
											Switch(this._.FieldIndex, {
												0 : Int24sb,
												1 : Int24sb,
												2 : Int16ub,
												3 : Int16ub,
												4 : Int16ub
											}
											)
										
										
										,
										"NodePowerDescriptor" : 
											Switch(this._.FieldIndex, {
												0 : Int8ub,
												1 : Int8ub,
												2 : Int16ub,
												3 : Int16ub,
												4 : Int16ub,
												5 : Int16ub,
												6 : Int16ub,
											}
											)
									},

									default = Switch(this._._._._._._.ClusterID, {
										"EnergyPowerMetering" : Int32ub ,
										"VoltageCurrentMetering" : Int16ub
										}	)								
									
									)
									

			
									
			

	},default = "Bytes" / BytesTostrHex
)

#decodage Cause dans report
Cause =  Struct(
	 "CriteriaSlotDescriptor" / CriteriaSlotDescriptor,

	 Embedded ( 
		If ( (this._.ReportParameters.CauseRequest == "Long"),
			Struct(
				 Embedded ( 	If ( (this._._._.AttributeType == "CharString") |
							    (this._._._.AttributeType  == "ByteString") |
							    (this._._._.AttributeType  == "LongByteString") |
							    (this._._._.AttributeType  == "StructOrderedSequence")
									, Struct("FieldIndex" / Int8ub)
							    )
				 ),
				"Value"/ DataCauseN3,
				"Gap"/ DataCauseN3,
				"Occurence"/ Occurence
			)
		 )
	),
)

#decodage Rp + Cause dans report
CauseRP =  Struct(
	 "ReportParameters" / ReportParameters,
	 "SlotDescriptors" / GreedyRange(Cause), #repeat until EOF by parsing with argument file
)




################# DECODAGE CAUSE CONFIGURATION ####################

ActDesc = BitStruct(
	"SendingOfreport" / Enum(Bit, Yes = 0 , No = 1),
	"Size" / BitsInteger(7),
 )

Action = Struct (
	"AoD" / Enum(Byte, Action = 0 , Delay = 1, Sendbatch = 2, SendReport = 3),
	Embedded ( 	If ( (this.AoD == "Action"), Struct("Index" / Byte) )	),
	Embedded ( 	If ( (this.AoD == "Delay"), Struct("Delay" / MinMaxField) )	),
) 
 
 
Actions = Struct( 	
		"ActDesc" / ActDesc,
		"Action" / Byte[this.ActDesc.Size],
		#"Action" / Action[this.ActDesc.Size/2],
		#"Action" / RepeatUntil(lambda obj,lst,ctx: , Action),

)

#DataBatch
ifBatch = Struct( 
									"FieldIndex" / Int8ub,
									"MinReport" / MinMaxField,
									"MaxReport" / MinMaxField,
									"Delta" / DataBatch,
									"Resolution" / DataBatch,
									"TagValue" / TagValue
									
)

#decodage Cause dans Configuration
CauseConfiguration =  Struct(
	"CriteriaSlotDescriptor" / CriteriaSlotDescriptor,
	Embedded ( 	If ( ((this._._._.AttributeType == "CharString") |
					   (this._._._.AttributeType  == "ByteString") |
					   (this._._._.AttributeType  == "LongByteString") |
					   (this._._._.AttributeType  == "StructOrderedSequence")), Struct("FieldIndex" / Int8ub)
					   )
	),
	Embedded ( 	If ( (1), Struct("Value"/DataCauseN4_FieldIndexN2)
				   )
	),	
	Embedded ( 	If ( (this.CriteriaSlotDescriptor.Mode != "Delta"), Struct("Gap"/ DataCauseN4_FieldIndexN2)
				   )
	),		
	Embedded ( 	If ( (this.CriteriaSlotDescriptor.Mode != "Delta"), Struct("Occurence"/ Occurence )
				   )
	),
	
	Embedded ( 	If ( (this.CriteriaSlotDescriptor.Mode == "ThresholdWithActions"), Struct("Actions" / Actions)
				   )
	),
)

