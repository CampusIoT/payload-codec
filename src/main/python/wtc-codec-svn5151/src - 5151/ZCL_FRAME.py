# -*- coding: utf-8 -*-
from ZCL import *

#from BATCH_FRAME import *

#if New configure report
DataNew = Struct(
	Embedded (If ((this._._.ReportParameters.New == "Yes") & (this._._.ReportParameters.NoHeaderPort == "Yes"),Struct("Port" / Byte))),
	Embedded (If ((this._._.ReportParameters.New == "Yes") , Struct("Cause" / GreedyRange(CauseConfiguration))))
)

#### FULL Standard frame description ####################e####
STDFrame = Struct(
	"FrameCtrl" / FrameCtrl,
	"CommandID" / CommandID,
	"ClusterID" / ClusterID,
	
	#Report
	Embedded ( 
		If ( ((this.CommandID == "ReportAttributesAlarm") |(this.CommandID == "ReportAttributes")),
			Struct(		"AttributeID" / AttributeID,
						"AttributeType" / DataType,
						"Data" / Data,
						"Cause" / GreedyRange(CauseRP)
			)
		)
	),
	#configure reporting
	Embedded ( 
		If (this.CommandID == "ConfigureReporting" ,
			Struct(		
						"ReportParameters" / ReportParameters,
						"AttributeID" / AttributeID,
						Embedded(IfThenElse(this.ReportParameters.Batch == "Yes",
								Struct(
									"Batches"/GreedyRange(ifBatch) 
								)						
								,						
								Struct(
									"AttributeType" / DataType,
									"MinReport" / MinMaxField,
									"MaxReport" / MinMaxField,
									#if New configure report
									Embedded ( 	IfThenElse ( 	((this.AttributeType == "CharString") |
												(this.AttributeType  == "ByteString") |
												(this.AttributeType  == "LongByteString") |
												(this.AttributeType  == "StructOrderedSequence")) & (this._.ReportParameters.New == "Yes"),
											
											Prefixed(Int8ub, DataNew),
											DataNew
										)
									),
									#if Old configure report
									"Data" / If ((this._.ReportParameters.New == "No") ,  Data ),
								)
							)
						)

			)
		)
	),
	#configure reporting response
	Embedded ( 
		If ( ((this.CommandID == "ConfigureReportingResponse")),
			Struct(		"Status" / Status,
						"ReportParameters" / ReportParameters,
						"AttributeID" / AttributeID,
			)
		)
	),
	
	#Read reporting Configuration
	Embedded ( 
		If ( (this.CommandID == "ReadReportingConfiguration"),
			Struct(		"ReportParameters" / ReportParameters,
						"AttributeID" / AttributeID
			)
		)
	),
	#Read reporting Configuration response
	Embedded ( 
		If ( ((this.CommandID == "ReadReportingConfigurationResponse")),
			Struct(	
						"Status" / Status,
						"ReportParameters" / ReportParameters,
						"AttributeID" / AttributeID,
						"AttributeType" / DataType,
						"MinReport" / MinMaxField,
						"MaxReport" / MinMaxField,
						#if New configure report
						Embedded ( 	IfThenElse ( 	((this.AttributeType == "CharString") |
									(this.AttributeType  == "ByteString") |
									(this.AttributeType  == "LongByteString") |
									(this.AttributeType  == "StructOrderedSequence")) & (this.ReportParameters.New == "Yes"),
								Prefixed(Int8ub, DataNew),
								DataNew
							)
						),
						#if Old configure report
						"Data" / If ((this.ReportParameters.New == "No") ,  Data ),
			)
		)
	),
	
	
	#Read Attribut request
	Embedded ( 
		If ( ((this.CommandID == "ReadAttribute")),
			Struct(		
						"AttributeID" / AttributeID,
			)
		)
	),
	
	#Read Attribut response
	Embedded ( 
		If ( ((this.CommandID == "ReadAttributeResponse")),
			Struct(		
						"AttributeID" / AttributeID,
						"Status" / Status,
						"AttributeType" / DataType,
						"Data" / Data
			)
		)
	),
	
	#Write Attribut no response
	Embedded ( 
		If ( ((this.CommandID == "WriteAttributeNoResponse")),
			Struct(		
						"AttributeID" / AttributeID,
						"AttributeType" / DataType,
						"Data" / Data
			)
		)
	),
	
	#Cluster Specific Command
	Embedded ( 
		If ( ((this.CommandID == "ClusterSpecificCommand")),
			Struct(		
						"Data" / GreedyRange(Byte)
			)
		)
	),
)