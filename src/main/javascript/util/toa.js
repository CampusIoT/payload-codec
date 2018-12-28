/**
 * Compute Time On Air of LoRa and LoRaWAN packets
 *
 * @see https://github.com/Lora-net/LoRaMac-node/blob/7a4aec588de628d864c364e9469ae45105fdbe26/src/radio/sx1272/sx1272.c
 *
 * @see Section 4
 * http://www.semtech.com/images/datasheet/LoraDesignGuide_STD.pdf
 *
 * @author Didier DONSEZ, Vivien QUEMA
 *
 * @TODO add FSK500 Time On Air
 * @class
 */
var TimeOnAir = {
    /**
     * get the time on air in ms for a LoRaWAN data frame
     *
     * @param {number} payloadLen
     * the applicative payload len (include port)
     * @param {number} optionsLen
     * the options len
     * @param {number} lorawanDataRate
     * (0 to 6. 7 is not implemented)
     * @return
     * @return {number}
     */
    getLoRaWANTimeOnAir : function (payloadLen, optionsLen, lorawanDataRate) {
        if (((typeof payloadLen === 'number') || payloadLen === null) && ((typeof optionsLen === 'number') || optionsLen === null) && ((typeof lorawanDataRate === 'number') || lorawanDataRate === null)) {
            return TimeOnAir.getLoRaWANTimeOnAir$int$int$int(payloadLen, optionsLen, lorawanDataRate);
        }
        else if (((typeof payloadLen === 'number') || payloadLen === null) && ((typeof optionsLen === 'number') || optionsLen === null) && lorawanDataRate === undefined) {
            return TimeOnAir.getLoRaWANTimeOnAir$int$int(payloadLen, optionsLen);
        }
        else
            throw new Error('invalid overload');
    },
    getLoRaWANTimeOnAir$int$int$int : function (payloadLen, optionsLen, lorawanDataRate) {
        return TimeOnAir.getLoRaWANTimeOnAir$int$int(13 + payloadLen + optionsLen, lorawanDataRate);
    },
    getLoRaWANTimeOnAir$int$int : function (frameLen, lorawanDataRate) {
        if (lorawanDataRate === 7) {
            return TimeOnAir.getFSKTimeOnAir(frameLen, 50000);
        }
        else {
            var bandwidth = lorawanDataRate < 6 ? 125000 : 250000;
            var sf = lorawanDataRate === 6 ? 7 : 12 - lorawanDataRate;
            var lowDatarateOptimize = lorawanDataRate < 2 ? true : false;
            var coderate = 5;
            var header = true;
            return TimeOnAir.getLoRaTimeOnAir(frameLen, 8, bandwidth, sf, lowDatarateOptimize, header, coderate);
        }
    },
    /**
     * get the time on air in ms for a LoRa packet
     *
     * @param {number} pktLen
     * should include 13 bytes LoRaWAN header and the application
     * payload
     * @param {number} preambleLen
     * 8 in LoRaWAN
     * @param {number} bandwidth
     * 125000, 250000, 500000
     * @param {number} SF
     * Spreading Factor (between 7 and 12)
     * @param {boolean} header
     * true if the frame includes a header
     * @param {boolean} lowDatarateOptimize
     * : the low data rate optimization bit is used. Specifically for
     * 125 kHz bandwidth and SF = 11 and 12, this adds a small
     * overhead to increase robustness to reference frequency
     * variations over the timescale of the LoRa packet.
     * @param {number} coderate
     * between 5 and 8 (4/5 and 4/8) 5 in LoRaWAN
     * @return {number} the time on air
     * @private
     */
    /*private*/ getLoRaTimeOnAir : function (pktLen, preambleLen, bandwidth, SF, lowDatarateOptimize, header, coderate) {
        var rs = bandwidth / (1 << SF);
        var ts = 1 / rs;
        var tPreamble = (preambleLen + 4.25) * ts;
        var ce = Math.ceil((((8 * pktLen) - (4 * SF) + 28 + 16 - (header ? 20 : 0)) / (4 * (SF - (lowDatarateOptimize ? 2 : 0))))) * (coderate);
        var nPayload = 8 + ((ce > 0) ? ce : 0);
        var tPayload = nPayload * ts;
        var tOnAir = tPreamble + tPayload;
        var airTime = Math.floor(tOnAir * 1000 + 0.999);
        return airTime;
    },
    /**
     * get the time on air in ms for a FSK packet
     * @param {number} pktLen
     * @param {number} bitrate
     * @return {number}
     * @private
     */
    getFSKTimeOnAir : function (pktLen, bitrate) {
        var airTime = ((pktLen + 5 + 3 + 1 + 2) * 8) * 1000 / bitrate;
        return airTime;
    }
};

    var payload = parseInt(process.argv[2],10);
    for (var dr = 0; dr <= 7; dr++) {
        console.info(dr + " : " + TimeOnAir.getLoRaWANTimeOnAir(payload, 0, dr));
    }
