# -*- coding: utf-8 -*-
from construct import *
import base64
import binascii


"""
	DEBUG: Use Probe(xxx), between subconst
	Exemple:
		Struct(
			"Count" / Int16ub, 
			"Bytes" / BytesTostrHexClass(GreedyBytes),
			Probe(this)
		),
		Probe(this)
	
"""

##### Purge Dict/Container from None values #########
def dictPurgeNoneValues(purged):
	if (isinstance(purged,dict) ):
		for k in list(purged):
			if purged[k] == None:
				del purged[k]
				# print(str(k)+"..DELETED")
			else:
				dictPurgeNoneValues(purged[k])
				
	elif (isinstance(purged,list) ):
		filter(lambda x: x!=None, purged)
		for k,item in enumerate(purged):
			dictPurgeNoneValues(purged[k])
			
	else:
		return purged

##### Bytes/Strings conversion Tools #####################################
class BytesTostrBase64(Adapter):
	# make specific EndPoint Encoding/Decoding
	
	def _encode(self, obj, context, path):
		obj_str = base64.b64decode(obj).encode()
		return obj_str
		return 0
		
	def _decode(self, obj, context, path):
		obj_base64 = base64.b64encode(obj).decode()
		return obj_base64

class BytesTostrHexClass(Adapter):
	# make specific EndPoint Encoding/Decoding
	
	def _encode(self, obj, context, path):
		obj_str = bytes.fromhex(obj)
		return obj_str
		
	def _decode(self, obj, context, path):
		obj_hex = binascii.hexlify(obj).decode()
		return obj_hex


		
""" 
def rootDictFind(key, myDict):
	for k in myDict:
		print("find2 search : k=%s" % (k))
		if k == key:
			print("find2 Found : k=%s, v=%s" % (k,str(myDict[k])) )
			return myDict[k]
	return None
"""

##### Value search from searchKey (this keyfunc object can be used in Switch (or if)
# IMPORTANT NOTE:
# - Find only a key "name" not a "key path". 
#   TODO: Make it capable of searching path to key: "key1.key2.searchKey"
#   Implies to modify also : fullDictFind
#
def fullDictFind(key, myDict):
	if isinstance(myDict,dict) or isinstance(myDict,list):
		for k in myDict:
			if k[:1] != '_': # Do not search all internal objects alone : _obj,_root etc ... Note: This._root is searched)
				print("find current key: %s (%s)" % (k,type(myDict)))
				v = myDict[k]
				if ((k == key) and (v is not None)): # Do not accept None values as it may figure that the container attribute is "zombie"
					yield v
				elif isinstance(v, dict):
					for result in fullDictFind(key, v):
						yield result
				elif isinstance(v, list):
					for d in v:
						print ("=== %s (%s)" % (d,type(d)))
						for result in fullDictFind(key, d):
							yield result

def GetValueFromKeyLookUP(context, searchKey): 
	# This order forces to find closest instance of searched key
	intoList = [this, this._,this._._,this._._._, this._root]
	foundValue = ""

	for item in intoList:
		try:
			print("Looking for key '%s' in '%s'" % (searchKey,item))
			container = item(context)
			foundValues = list(fullDictFind(searchKey, container))
			if (len(foundValues) != 0): # Value of FIRST item found returned !!
				foundValue = foundValues[0] 
				print("Found : %s" % foundValue)
				break
				
		except KeyError:
			next
	
	return(foundValue)
	
##### Typicall searched ZCL objects
def FindClusterID(context): 
	return(GetValueFromKeyLookUP(context, "ClusterID"))

def FindCommandID(context): 
	return(GetValueFromKeyLookUP(context, "CommandID"))

def FindAttributeID(context): 
	return(GetValueFromKeyLookUP(context, "AttributeID"))

def FindAttributeType(context): 
	return(GetValueFromKeyLookUP(context, "AttributeType"))

def FindFieldIndex(context): 
	return(GetValueFromKeyLookUP(context, "FieldIndex"))

def FindCauseRequest(context): 
	return(GetValueFromKeyLookUP(context, "CauseRequest"))

def FindMode(context): 
	return(GetValueFromKeyLookUP(context, "Mode"))
	
def FindFieldIndex(context): 
	return(GetValueFromKeyLookUP(context, "FieldIndex"))
	
def FindFieldReportParameters(context): 
	return(GetValueFromKeyLookUP(context, "ReportParameters"))
	
def FindFieldReportParameters_New(context): 
	#toto = GetValueFromKeyLookUP(context, "ReportParameters")
	#sys.stdout.write("++++++++++++++++++++++++++++++++")
	#sys.stdout.write("++++++++++++++++++++++++++++++++ %s" % toto)
	return(GetValueFromKeyLookUP(context, "New"))
	
def FindFieldIsBatch(context): 
	return(GetValueFromKeyLookUP(context, "IsBatch"))
