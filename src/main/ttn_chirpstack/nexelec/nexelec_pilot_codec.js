///////////////////////////////////////////////////////////////////////////////////
// NEXELEC
// THIS SOFTWARE IS PROVIDED BY NEXELEC ``AS IS'' AND ANY
// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL NEXELEC BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
///////////////////////////////////////////////////////////////////////////////////

function Decoder(bytes) {
var decode=[];
var string_bin="";
var tab_bin=[];
var string_bin_elements=""; 
var buffer=[];
var i=0;
var j=0;

// Mise en forme de la payload propre à TTN
for(i=0;i<bytes.length;i++){ // conversion d'hexa à binaire de tous les bytes puis regroupement sous un seul string
     string_bin_elements=bytes[i].toString(2);
     if(string_bin_elements.length<8){ // PadStart 
       var nb_zeros=8-string_bin_elements.length;
       for (j=0;j<nb_zeros;j++){
         string_bin_elements="0"+string_bin_elements;
       }
     }
     string_bin=string_bin+string_bin_elements;
 }
 
var compte=0;
for(i=0;i<2*bytes.length;i++){
    buffer[i]="";
    for( j=0;j<4;j++){ // tableau contenant un hexa de la payload par adresse
        buffer[i]=buffer[i]+string_bin.charAt(compte);
        compte++;
    }
    buffer[i]=parseInt(buffer[i],2);
}

// Décodage
var Insafe_Pilot_LoRa=0x6;

switch(buffer[0]){
case Insafe_Pilot_LoRa:
	decode[0]={"Type_of_Product":"Insafe_Pilot_LoRa"};
	break;
}

if (buffer[0]==Insafe_Pilot_LoRa){
	// On crée les différents tableaux correspondant à la taille de chaque data en terme de  bits 
	var tab_decodage_Pilot_Product_Status_Message=[4,4,2,1,3,2];
	var tab_decodage_Pilot_Real_Time=[4,4,8,8,3,4,3,3,3,2,3,3];
	var tab_decodage_Pilot_Datalog=[4,4,8,8,8,8,8,8,8,8,8,8,4,3,1];
	var tab_decodage_Pilot_Config_General_LoRa=[4,4,1,1,1,1,1,1,2,8,8,8,8,8,8,8,8];
	var tab_decodage_Pilot_Push=[4,4,3,3,2];
	var tab_decodage_Pilot_Temperature_Alert=[4,4,8,1,1,3,3];
	var tab_decodage_Pilot_Keepalive=[4,4];

	// On initialise les différents type de message
	var Type_Pilot_Product_Status_Message=0x0;
	var Type_Pilot_Real_Time= 0x1;
	var Type_Pilot_Datalog=0x2;
	var Type_Pilot_Config_General=0x3;
	var Type_Pilot_Push= 0x4;
	var Type_Pilot_Temperature_Alert=0x5;
	var Type_Pilot_Keep_Alive=0x6;
    var Type_Pilot_debug_battery= 0xF;
    
    var tab_adjectif=["Excellent","Good","Fair","Poor","Bad","Erreur","All","Dryness Indicator","Mould Indicator","Dust Mites Indicator","CO","CO2"];
    
// Avec buffer[1], on détermine le Type de Message
  switch(buffer[1]){
 
    case Type_Pilot_Product_Status_Message:
         tab_decode(tab_decodage_Pilot_Product_Status_Message);
         decode[1]={"Type_of_message":"Product_Status_Message"};
         decode[2]={"Battery_level":battery(tab_bin[2])};
         decode[3]={"HW_Fault_mode":hw_mode(tab_bin[3])};
         decode[4]={"Frame_Index":tab_bin[4]};
         decode[5]={"Not_used":""};
         break; 
  
     case Type_Pilot_Real_Time:
          tab_decode(tab_decodage_Pilot_Real_Time); //(VOIR EN FIN DE PROGRAMME) On passe le tableau correspondant au message dans la fonction tab_decode, cette fonction renvoie tab_bin. 
          decode[1]={"Type_of_message":"Real_Time"};
          decode[2]={"Temperature(°C)": Math.round(0.2*tab_bin[2] * 10) / 10} 
          decode[3]={"Relative_Humidity_(%RH)": 0.5*tab_bin[3]}
          decode[4]={"IAQ_GLOBAL":get_iaq(tab_bin[4])}
          decode[5]={"IAQ_SRC":get_iaq_SRC(tab_bin[5])}
          decode[6]={"IAQ_DRY":get_iaq(tab_bin[6])}
          decode[7]={"IAQ_MOULD":get_iaq(tab_bin[7])}
          decode[8]={"IAQ_DM":get_iaq(tab_bin[8])}
          decode[9]={"IAQ_HCI":get_IAQ_HCI(tab_bin[9])}
          decode[10]={"Frame_Index":tab_bin[10]};
         break;
 
    case Type_Pilot_Datalog:
          tab_decode(tab_decodage_Pilot_Datalog);            
          decode[1]={"Type_of_message":"Datalog"};
          decode[2]={"Temperature(°C)_[n-4]": Math.round(0.2*tab_bin[2] * 10) / 10};
          decode[3]={"Relative Humidity(%)_[n-4]": Math.round((0.5*tab_bin[3])*10)/10};
          decode[4]={"Temperature(°C)_[n-3]": Math.round(0.2*tab_bin[4] * 10) / 10};
          decode[5]={"Relative Humidity(%)_[n-3]": Math.round((0.5*tab_bin[5])*10)/10};
          decode[6]={"Temperature(°C)_[n-2]": Math.round(0.2*tab_bin[6] * 10) / 10};
          decode[7]={"Relative Humidity(%)_[n-2]": Math.round((0.5*tab_bin[7])*10)/10};   
          decode[8]={"Temperature(°C)_[n-1]": Math.round(0.2*tab_bin[8] * 10) / 10};
          decode[9]={"Relative Humidity(%)_[n-1]": Math.round((0.5*tab_bin[9])*10)/10};
          decode[10]={"Temperature(°C)_[n]": Math.round(0.2*tab_bin[10] * 10) / 10};
          decode[11]={"Relative Humidity(%)_[n]": Math.round((0.5*tab_bin[11])*10)/10};		  
          decode[12]={"Time_between_measurements_in_minutes": 10*tab_bin[12]};
          decode[13]={"Frame_Index":tab_bin[13]}; 
          decode[14]={"Not_used":""};          
         break 

    case Type_Pilot_Config_General:

         tab_decode(tab_decodage_Pilot_Config_General_LoRa); 
         decode[1]={"Type_of_message":"Config_General"};
         decode[2]={"LED blink": active(tab_bin[2])};
         decode[3]={"Button Notification": active(tab_bin[3])};    
         decode[4]={"Real-time data": active(tab_bin[4])};    
         decode[5]={"Datalog function": active(tab_bin[5])};    
         decode[6]={"Temperature Alert": active(tab_bin[6])};      
         decode[7]={"Keep Alive": active(tab_bin[7])};    
         decode[8]={"Not_used":""}; 
         decode[9]={"Period between measurements (CO2,temperature, humidity) (minutes)": tab_bin[9]};  
         decode[10]={" Datalog decimation factor(record only 1 on x samples)":tab_bin[10]};
         decode[11]={"Temperature alert threshold 1 (°C)": 0.2*tab_bin[11]};
         decode[12]={"Temperature alert threshold 2 (°C)": 0.2*tab_bin[12]}; 
         decode[13]={"Temperature change leading to a real-time message transmission (°C)": 0.1*tab_bin[13]}; 
         decode[14]={"Relative humidity change leading to a real-time message transmission (%RH)": (0.5*tab_bin[14])}; 
         decode[15]={"Keepalive period (h)": tab_bin[15]}; 
         decode[16]={"Software_version_of_the_product":tab_bin[16]};  
         break		 

	case Type_Pilot_Push:
         tab_decode(tab_decodage_Pilot_Push);       
         decode[1]={"Type_of_message":"Push"};
         decode[2]={"Push_Button_Action": push_button(tab_bin[2])};
         decode[3]={"Frame_Index":tab_bin[3]};
         decode[4]={"Not_used":""}
         break;
      
     case Type_Pilot_Temperature_Alert:
         tab_decode(tab_decodage_Pilot_Temperature_Alert);             
         decode[1]={"Type_of_message":"Temperature_Alert"};
         decode[2]={"Temperature(°C)": Math.round(temp(tab_bin[2]) * 10) / 10};
         decode[3]={"Temperature threshold 1":th(tab_bin[3])};
         decode[4]={"Temperature threshold 2":th(tab_bin[4])};
         decode[5]={"Frame_Index":tab_bin[5]}; 
         decode[6]={"Not_used":""};              
         break
 
    case Type_Pilot_Keep_Alive:
         decode[1]={"Type_of_message":"Keep_Alive"};
         break
         
    case Type_Pilot_debug_battery:
         tab_decode(tab_decodage_battery_level);
         decode[1]={"Type_of_message":"Battery_level"};
         decode[2]={"Tension_batterie(mV)": tab_bin[2]};	  
         break;
         
  }// end switch buffer[1]	
}//end switch buffer[0] = Insafe_Pilot_LoRa
	 
var new_msg={payload:decode};
return new_msg;

function tab_decode (tab){ // on rentre en paramètre la table propre à chaque message 
	var compteur=0;
	for ( i=0; i<tab.length;i++){  // tab.length nousdonne donc le nombre d'information à décoder pour ce message 
		tab_bin[i]="";
		for ( j=0; j<tab[i];j++){ // tab[i] nous donne le nombre de bits sur lequel est codée l'information i 
			str1=string_bin.charAt(compteur); // compteur va aller de 0 jusqu'à la longueur de string_bin
			tab_bin[i]=tab_bin[i]+str1;       // A la fin de ce deuxième for: tab_bin[i] sera composé de tab[i] bits 
			compteur++;
		}
		// Problème si tab[i] bits est différent de 4 (ou 8) bits ca ne correspond à 1 (ou 2) hexa donc:  ne pourra pas conrrectement convertir les binaires en hexa
		// Donc  il faut qu'on fasse un bourrage de 0 grâce à padstart
		if (tab_bin[i].length>4){ // pour les données de tailles supérieures à 4 bits et inféireures ou égales à 8 bits		
			//tab_bin[i]=tab_bin[i].padStart(8,'0');
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase(); // Puis on convertit les binaire en hexa (en string)
			tab_bin[i]=parseInt(tab_bin[i],16) ;//puis on convertit les string en int	
		}
		else{ // pour les données de tailles inférieures ou égales à 4 bits
			//tab_bin[i]=tab_bin[i].padStart(4,'0');
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase();
			tab_bin[i]=parseInt(tab_bin[i], 16);
		}
	}
 }


function get_iaq (a){
	var result="";
	switch(a){
	case 0:
		result=tab_adjectif[0];
		break;
	case 1:
		result=tab_adjectif[1];
		break;
	case 2:
		result=tab_adjectif[2];
		break;
	case 3:
		result=tab_adjectif[3];
		break;
	case 4:
		result=tab_adjectif[4];
		break;
	case 5:
		result=tab_adjectif[5];
		break;
	}
	return result; 
}

function get_iaq_SRC(a){
	
	var result="";
	switch(a){
	case 0:
		result=tab_adjectif[6];
		break;
	case 1:
		result=tab_adjectif[7];
		break;
	case 2:
		result=tab_adjectif[8];
		break;
	case 3:
		result=tab_adjectif[9];
		break;
	case 4:
		result=tab_adjectif[10];
		break;
	case 5:
		result=tab_adjectif[11];
		break;
	case 15:
		result=tab_adjectif[5];
		break;
	}
	return result; 
}

function get_IAQ_HCI(a){
	var result="";
	switch(a){
	case 0:
		result=tab_adjectif[1];
		break;
	case 1:
		result=tab_adjectif[2];
		break;
	case 2:
		result=tab_adjectif[4];
		break;
	case 3:
		result=tab_adjectif[5];
		break;
	}
	return result; 
}


function tab_decode (tab){ // on rentre en paramètre la table propre à chaque message 
	var compteur=0;
	for ( i=0; i<tab.length;i++){  // tab.length nousdonne donc le nombre d'information à décoder pour ce message 
		tab_bin[i]="";
		for ( j=0; j<tab[i];j++){ // tab[i] nous donne le nombre de bits sur lequel est codée l'information i 
			str1=string_bin.charAt(compteur); // compteur va aller de 0 jusqu'à la longueur de string_bin
			tab_bin[i]=tab_bin[i]+str1;       // A la fin de ce deuxième for: tab_bin[i] sera composé de tab[i] bits 
			compteur++
		}
		
		// Problème si tab[i] bits est différent de 4 (ou 8) bits ca ne correspond à 1 (ou 2) hexa donc:  ne pourra pas conrrectement convertir les binaires en hexa
		// Donc  il faut qu'on fasse un bourrage de 0 grâce à padstart
		if (tab_bin[i].length>4){ // pour les données de tailles supérieures à 4 bits et inféireures ou égales à 8 bits
			var nb_zeros=8-tab_bin[i].length;
            for (j=0;j<nb_zeros;j++){
                tab_bin[i]="0"+tab_bin[i];
            }
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase(); // Puis on convertit les binaire en hexa (en string)
			tab_bin[i]=parseInt(tab_bin[i],16) //puis on convertit les string en int
		}	
		else{ // pour les données de tailles inférieures ou égales à 4 bits
			var nb_zeros=8-tab_bin[i].length;
			for (j=0;j<nb_zeros;j++){
         tab_bin[i]="0"+tab_bin[i];
       }
			tab_bin[i]=parseInt(tab_bin[i] , 2).toString(16).toUpperCase();
			tab_bin[i]=parseInt(tab_bin[i], 16);
		}
	}
	return tab_bin; 
}


function battery(a){
	result="";
	switch(a){
	case 0:
		result="High";
		break;
	case 1: 
		result="Medium";
		break;
	case 2: 
		result="Critical";
		break;
	}
	return result;
}


function hw_mode(a){
	result="";
	switch(a){
	case 0:
		result=" non activated";
		break;
	case 1: 
		result=" activated";
		break;
	}
	return result;
}

function push_button(a){
	result="";
	switch(a){
	case 0: 
		result="Short Push";
		break;
		
	case 1: 
		result="Long Push";
		break;
		
	case 2: 
		result="Multiple Push(x3)";     
		break;
		
	case 3: 
		result="Multiple Push(x6)";     
		break;                
	}
	
	return result;
}

function th(a){
	result="";
	switch(a){
	case 0: 
		result="not reached";
		break;
	case 1: 
		result="reached";
		break;
	}
	return result;
}

function active(a){
	result="";
	switch(a){
	case 0: 
		result="Non-Active";
		break;
	case 1: 
		result="Active";
	}
	return result;
}

function nfc_status(a)
{
  result="";
	switch(a){
	case 0: 
		result="Discoverable";
		break;
	case 1: 
		result="Not_Discoverable";
	}
	return result;
}

 msg.payload=decode;
 return msg;
 
}
