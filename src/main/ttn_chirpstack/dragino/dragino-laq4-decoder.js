//
// Decoder for LAQ4 -- LoRaWAN Air Quality Sensor
// https://www.dragino.com/products/lora-lorawan-end-node/item/174-laq4.html 
// From https://www.dragino.com/downloads/index.php?dir=LoRa_End_Node/LAQ4/
//

// Chirpstack
function Decode(fPort, bytes, variables) {
    var mode=(bytes[2] & 0x7C)>>2;
    var data = {};
    data.Bat_V=(bytes[0]<<8 | bytes[1])/1000; 
    if(mode==1)
    {
      data.Work_mode="CO2";
      data.Alarm_status=(bytes[2] & 0x01)? "TRUE":"FALSE"; 
      data.TVOC_ppb= bytes[3]<<8 | bytes[4]; 
      data.CO2_ppm= bytes[5]<<8 | bytes[6];
      data.TempC_SHT=parseFloat(((bytes[7]<<24>>16 | bytes[8])/10).toFixed(2));
      data.Hum_SHT=parseFloat(((bytes[9]<<8 | bytes[10])/10).toFixed(1));  
    }
    else if(mode==31)
    {
      data.Work_mode="ALARM";
      data.SHTEMPMIN= bytes[3]<<24>>24;
      data.SHTEMPMAX= bytes[4]<<24>>24;   
      data.SHTHUMMIN= bytes[5];
      data.SHTHUMMAX= bytes[6]; 
      data.CO2MIN= bytes[7]<<8 | bytes[8]; 
      data.CO2MAX= bytes[9]<<8 | bytes[10]; 
    }
    
    if(bytes.length==11)
    {
      return data;
    }
  }


// TTN v2
function Decode(fPort, bytes, variables) {
    return Decode(bytes, fPort);
}
