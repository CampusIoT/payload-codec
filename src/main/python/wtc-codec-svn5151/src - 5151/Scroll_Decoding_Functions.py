# -*- coding: utf-8 -*-

import json 
import dicttoxml
import xml
from xml.dom.minidom import parseString
import xml.etree.ElementTree as ET
from xml.etree.ElementTree import ElementTree
from xml.etree import cElementTree as ET
from xml.dom import minidom
from ZCL_FRAME import *
from ZCL import *
import datetime
import sys
import argparse
#from BATCH_FRAME import *


#110A00520000410C000A80000000080808FFFFFE
#### Fonctions de Basse ##############################
version_d ='Decodeur v1.0'

#-- Programme de lancement de decodage
def Input_trame(version_d):
	i=0
	date = datetime.datetime.now()
	sys.stderr.write ('\n\n')
	sys.stderr.write ('\n\n')
	sys.stderr.write (version_d)	
	sys.stderr.write ('\n|--------------------------------------------------|')
	sys.stderr.write ('\n|---------------DECODEUR ZCL-----------------------|')
	sys.stderr.write ('\n|--------------------------------------------------|\n\n')
	sys.stderr.write ('\nEntrer votre trame:\n')
	trame = input()

	while i==0:
		sys.stderr.write ('\nChoisir le format de decodage:\n')
		sys.stderr.write ('\n 1-->Standard')
		sys.stderr.write ('\n 2-->JSON')
		sys.stderr.write ('\n 3-->XML_Pretty')
		sys.stderr.write ('\n 4-->XML_Line\n')
		format = input()
		

		if format == ("Standard") or  format ==  ("1"):
			Decodage_Python_deroulant(trame),
			break
		elif format == ("JSON" ) or format ==("2"):
			Decodage_JSON_deroulant(trame),
			break
		elif format == ("XML_Pretty") or  format == ("3"):
			Decodage_XML_Pretty_deroulant(trame),
			break
		elif format == ("XML_Line") or format == ("4"):
			Decodage_XML_Line_deroulant(trame),
			break
		else :
			sys.stderr.write ("\n\n\nERREUR DE SAISIE\n\n\n"),

####Fonctions liées au python ##############################
#-- codage/decodage en Python
def Decodage_Python_deroulant(trame):
	sys.stderr.write ('\n\n\n|--------------------------------------------------|')
	sys.stderr.write ('\n|---------------Notation PYTHON--------------------|')
	sys.stderr.write ('\n|--------------------------------------------------|\n')
	sys.stderr.write ('\n\nDecodage en Notation Python:\n\n')
	print ( STDFrame.parse(unhexlify(trame) ) )

	
#### Fonctions liées au JSON##############################
#-- codage/decodage en JSON
def Decodage_JSON_deroulant(trame):
	sys.stderr.write ('\n\n\n|--------------------------------------------------|')
	sys.stderr.write ('\n|---------------Notation JSON----------------------|')
	sys.stderr.write ('\n|--------------------------------------------------|\n')
	sys.stderr.write ('\nDecodage en Notation JSON:\n\n')
	print(json.dumps(STDFrame.parse(unhexlify(trame) ),indent=5))


#### Fonctions liées au XML ##############################
#-- codage/decodage en XMl
def Decodage_XML_Pretty_deroulant(trame):
	sys.stderr.write ('\n\n\n|--------------------------------------------------|')
	sys.stderr.write ('\n|---------------Notation XML-----------------------|')
	sys.stderr.write ('\n|--------------------------------------------------|\n')
	sys.stderr.write ('\n\nDecodage en Notation Pretty XML:\n\n')
	xml_with_ids = dicttoxml.dicttoxml(STDFrame.parse(unhexlify(trame) ),custom_root='NKE_Frame_Codec_v_1.0')
	print(parseString(xml_with_ids).toprettyxml())

def Decodage_XML_Line_deroulant(trame):	
	sys.stderr.write ('\n\n\n|--------------------------------------------------|')
	sys.stderr.write ('\n|---------------Notation XML-----------------------|')
	sys.stderr.write ('\n|--------------------------------------------------|\n')
	sys.stderr.write ('\nDecodage en Notation Compacte XML:\n\n')
	print(dicttoxml.dicttoxml(STDFrame.parse(unhexlify(trame) ),custom_root='NKE_Frame_Codec_v_1.0'))

	
