function getLoRaWANDatarate(dataRate){
  if(dataRate.modulation === "LORA") {
    if(dataRate.bandwidth === 125) {
      switch(dataRate.spreadFactor) {
        case 12: return 0;
        case 11: return 1;
        case 10: return 2;
        case 9: return 3;
        case 8: return 4;
        case 7: return 5;
        default: return undefined;
      }
    } else if(dataRate.bandwidth === 250 && dataRate.spreadFactor === 7) {
      return 6;
    }
  } if(dataRate.modulation === "FSK") {
    return 7;
  }
  return undefined;
} 
