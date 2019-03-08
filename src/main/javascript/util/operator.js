// =======================================
// Operator
// =======================================

// https://www.thethingsnetwork.org/wiki/LoRaWAN/Address-Space#address-space-in-lorawan_devices_prefix-assignments

// See LoRaWAN Backend Interfaces v1.0, Section 13: DevAddr Assignment

// There are different types of NetIDs (Types 0 through 7), which differ based on the size of end-device address spacethey support (see LoRaWAN™ Backend Interfaces v1.0 for details). Sponsor members are granted one Type 0 and one Type 3 NetID, contributor members are grantedone Type 3and one Type 6 NetID, and adopter and institutional members are granted one Type 6 NetID.Unused NetID types (Types 1, 2, 4, 5, 7) are reserved for futureuse. They may be used when the currently assigned types are fully consumedor NwkIDs generated fromNetIDs start to collide.


// NetID Type 0, Type Prefix Length (MSB) = 1, Type Prefix Value (binary) = 0b, Number of NwkID bits = 6, Number of NwkAddr bits = 25
const operators_0 = {
  0:['Local','Experimental'],
  2:['Local','Experimental2'],
  4:['World','Actility'],
  6:['Europe','Proximus'],
  8:['Europe','Swisscom'],
  10:['Singapore, Indonesia , Australia, Africa , India','SingTel'],
  12:['Europe','La Poste'],
  14:['Europe','Bouygues Telecom'],
  16:['World','Orbiwise'],
  18:['U.S','SENET'],
  20:['Europe','KPN'],
  22:['Russia','EveryNet'],
  24:['Africa','FastNet'],
  26:['World','SK Telecom'],
  28:['World','SagemCom'],
  30:['Europe','Orange France'],
  32:['Italy','A2A Smart City'],
  34:['India, Sri Lanka, Nepal, Bangladesh and the Maldives Islands','TATA Communication'],
  36:['World','Kerlink'],
  38:['World','The Things Network'],
  40:['Germany, Switzerland, China','DIGIMONDO GmbH'],
  42:['World','Cisco Systems'],
  44:['China','Computer Network Information Center & Chinese of Sciences Guangzhou Sub-center (CNIC)'],
  46:['World','MultiTech Systems'],
  48:['World','Loriot'],
  50:['World','NNNCo'],
  52:['World','Flashnet'],
  54:['World','TrackNet'],
  56:['World','Lar.Tech'],
  58:['World','Swiss Led'],
  60:['CIS, Europe','Net868'],
  62:['Italy','Axatel'],
  64:['Germany','Telent (Netzikon)'],
  66:['World','Patavina Technologies'],
  68:['North America','Comcast'],
  70:['Australia, New Zealand','Ventia'],
  72:['World','Gimasi'],
  74:['World','Talkpool'],
  76:['Italy','Telemar'],
  78:['World','MCF88 SRL'],
  80:['Malaysia','VADSLYFE'],
  82:['World','GIoT'],
  84:['World','M2B Communications'],
  86:['China','ZTE'],
  88:['Australia','Airlora'],
  90:['World','Rai Way'],
  92:['World','Levikom'],
  94:['South Africa','Comsol Networks'],
  96:['World','SoftBank'],
  98:['World','Inmarsat'],
  100:['World','Gemalto'],
  102:['China','Alibaba Iot BU'],
  104:['Russian Federation','ER-Telecom Holding']
};

// NetID Type 3, Type Prefix Length (MSB) = 4, Type Prefix Value (binary) = 1110, Number of NwkID bits = 10, Number of NwkAddr bits = 18
const operators_e0 = {
    0xe000:["RESERVED","RESERVED"],
    0xe002:["Finland","Digita"],
    0xe004:["Sweden, Norway","Blink"],
    0xe008:["North and South America","eleven-x"],
    0xe00a:["World","IoT Network AS"],
    0xe00c:["Asia, Middle East","Senra Tech"],
    0xe00e:["World","EDF"],
    0xe010:["Italy","Unidata"],
    0xe012:["Scandinavia","SEAS-NVE"],
    0xe014:["Scandinavia","Öresundskraft"],
    0xe016:["Romania","Ad Net Market Media"],
    0xe018:["World","SenSys"],
    0xe01a:["Thailand","CAT Telecom"],
    0xe01c:["World","Spark"],
    0xe01e:["China","ThingPark China"],
    0xe020:["World","Senet"],
    0xe022:["Japan","SenseWay"],
    0xe024:["Philippines","Packetworx"],
    0xe026:["World","Actility"],
    0xe028:["China","Alibaba IoT BU"],
    0xe02a:["World","Kerlink"],
    0xe02c:["World","Cisco"],
    0xe02e:["World","Schneider Electric"]

}

// NetID Type 6, Type Prefix Length (MSB) = 7, Type Prefix Value (binary) = 1111110, Number of NwkID bits = 15, Number of NwkAddr bits = 10
const operators_fc00 = {
    0xfc0000:["RESERVED","RESERVED"],
    0xfc0004:["World","Nordic Automation Systems"],
    0xfc0008:["World","ResIOT"],
    0xfc000c:["World","SYSDEV"],
    0xfc0010:["China,Canada","Appropolis"],
    0xfc0014:["Japan","Macnica"],
    0xfc0018:["Sweden, Finland, Norway, Denmark","IP-Only"],
    0xfc001c:["Russia Federation","Thingenix LLC"],
    0xfc0020:["World","Definium Technologies"],
    0xfc0024:["Germany ,only Darmstadt Region)","ENTEGA AG"],
    0xfc0028:["Japan","SenseWay"],
    0xfc002c:["Tunisia","3S"],
    0xfc0030:["World","nFore Technology"],
    0xfc0034:["Philippines","Packetworx"],
    0xfc0038:["Sultanate Oman, Omani","Qatari Telecommunications (Ooredoo)"],
    0xfc003c:["Hungary","Antenna Hungaria Co"],
    0xfc0040:["Europe","Trinity College, Dublin"],
    0xfc0044:["World","Digital Nordix AB (DNX)"],
    0xfc0048:["Sweden, Norway","Blink Services"],
    0xfc004c:["Norway","Lyse AS"],
    0xfc0050:["Vietnam","VTC Digicom"],
    0xfc0054:["Saudi Arabia","Machines Talk"],
    0xfc0058:["World","Schneider Electric"],
    0xfc0062:["UK","Connexin"]
};

// ===================================

function getOperator(devAddr) {
    let entry;
    let idx;
    let operator;

    if(((devAddr >> 16) & 0xffff) === 0xfc00) {
        idx = (((devAddr >> 10) << 2) & 0xffffff);
        entry = operators_fc00[idx];
        if(entry) {
            operator = entry[1];
        }
    } else if(((devAddr >> 24) & 0xff) === 0xe0) {
        idx = (((devAddr >> 17) << 1) & 0xffff);
        entry = operators_e0[idx];
        if(entry) {
          operator = entry[1];
        }
    } else {
        idx = (((devAddr >> 25) << 1) & 0xff);
        entry = operators_0[idx];
        if(entry) {
          operator = entry[1];
        }
    }

    if(operator === undefined) {
      operator = "Unknown " + Number(idx).toString(16);
    }
    return operator;
}

function usage(){
  console.log(process.argv[1]+" <devaddr>");
}

const args = process.argv;
if(args.length !== 3) {
  usage();
  process.exit(1);
}

var buf = Buffer.from(process.argv[2],"hex");
var devaddr= buf.readUInt32BE(0);
console.log(getOperator(devaddr));
