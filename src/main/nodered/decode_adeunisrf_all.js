

/**
 *              _                  _     
 *     /\      | |                (_)    
 *    /  \   __| | ___ _   _ _ __  _ ___ 
 *   / /\ \ / _` |/ _ \ | | | '_ \| / __|
 *  / ____ \ (_| |  __/ |_| | | | | \__ \
 * /_/    \_\__,_|\___|\__,_|_| |_|_|___/
 *                                       
 * 
 * JavaScript/Node.js library of Adeunis codecs v1.1.1
 * Supported products: [COMFORT, DRY CONTACTS, MOTION, PULSE, Pulse 3, TEMP, Temp 3, REPEATER, DELTA P]
 * 
 * This source code is provided "as-is" and with no warranties. Adeunis is not responsible for its use.
 * 
 */


"use strict";
var codec;
(function (codec) {
    /**
     * Decoder class.
     *
     * Main class for decoding purposes.
     * Contains declaration of all required parsers and decode() method (API entry point).
     *
     * See below for explanations on parsers.
     */
	var Decoder = /** @class */ (function () {
        /**
         * Constructor
         * @param options option object
         *   option.codecStorage: implementation of CodecStorage to use for external storage, leave blank if unknown
         */
		function Decoder(options) {
            /**
             * Parsers declaration.
             *
             * Array of parser implementations that can be used by the library.
             *
             * Parsers are specific handlers for parsing frame of a device type and a frame code.
             */
			this.parsers = [
				// Generic parsers not used for REPEATER
				new codec.GenericStatusByteParser(),
				new codec.Generic0x10Parser(),
				new codec.Generic0x20Parser(),
				new codec.Generic0x2fParser(),
				new codec.Generic0x30Parser(),
				new codec.Generic0x33Parser(),
				// DC product
				new codec.Dc0x10Parser(),
				new codec.Dc0x30Parser(),
				new codec.Dc0x40Parser(),
				// PULSE product
				new codec.Pulse0x10Parser(),
				new codec.Pulse0x11Parser(),
				new codec.Pulse0x12Parser(),
				new codec.Pulse0x30Parser(),
				new codec.Pulse0x46Parser(),
				new codec.Pulse0x47Parser(),
				new codec.Pulse0x48Parser(),
				// Pulse 3 product
				new codec.PulseV3StatusByteParser(),
				new codec.PulseV30x10Parser(),
				new codec.PulseV30x11Parser(),
				new codec.PulseV30x12Parser(),
				new codec.PulseV30x30Parser(),
				new codec.PulseV30x46Parser(),
				new codec.PulseV30x47Parser(),
				new codec.PulseV30x5aParser(),
				new codec.PulseV30x5bParser(),
				// TEMP product
				new codec.TempStatusByteParser(),
				new codec.Temp0x10Parser(),
				new codec.Temp0x11Parser(),
				new codec.Temp0x12Parser(),
				new codec.Temp0x30Parser(),
				new codec.Temp0x43Parser(),
				// Temp 3 product
				new codec.TempV3StatusByteParser(),
				new codec.TempV30x10Parser(),
				new codec.TempV30x30Parser(),
				new codec.TempV30x57Parser(),
				new codec.TempV30x58Parser(),
				// COMFORT product
				new codec.ComfortStatusByteParser(),
				new codec.Sb0x1fParser(),
				new codec.Sb0x51Parser(),
				new codec.Sb0x52Parser(),
				new codec.Comfort0x1fParser(),
				new codec.Comfort0x10Parser(),
				new codec.Comfort0x4cParser(),
				new codec.Comfort0x4dParser(),
				new codec.Comfort0x30Parser(),
				new codec.Comfort0x51Parser(),
				new codec.Comfort0x52Parser(),
				// MOTION produc
				// new Sb0x1fParser(),
				// new Sb0x51Parser(),
				// new Sb0x52Parser(),
				new codec.MotionStatusByteParser(),
				new codec.Motion0x1fParser(),
				new codec.Motion0x10Parser(),
				new codec.Motion0x30Parser(),
				new codec.Motion0x4eParser(),
				new codec.Motion0x4fParser(),
				new codec.Motion0x50Parser(),
				new codec.Motion0x51Parser(),
				new codec.Motion0x52Parser(),
				// REPEARER product
				new codec.Repeater0x01Parser(),
				new codec.Repeater0x02Parser(),
				new codec.Repeater0x03Parser(),
				new codec.Repeater0x04Parser(),
				// DELTAP product
				// new Sb0x1fParser(),
				// new Sb0x51Parser(),
				// new Sb0x52Parser(),
				new codec.DeltapStatusByteParser(),
				new codec.Deltap0x1fParser(),
				new codec.Deltap0x10Parser(),
				new codec.Deltap0x11Parser(),
				new codec.Deltap0x30Parser(),
				new codec.Deltap0x51Parser(),
				new codec.Deltap0x52Parser(),
				new codec.Deltap0x53Parser(),
				new codec.Deltap0x54Parser(),
				new codec.Deltap0x55Parser(),
				new codec.Deltap0x56Parser(),
			];
			if (options && options.codecStorage) {
				// External storage: Node-RED...
				this.codecStorage = options.codecStorage;
			}
			else if (typeof localStorage !== 'undefined') {
				// Local storage: browser
				this.codecStorage = localStorage;
			}
			else {
				// Default (JS object)
				this.codecStorage = new codec.InternalCodecStorage();
			}
			// TODO: check parsers uniqueness
		}
        /**
         * Get supported device types and frame codes.
         *
         * The returned pairs are available for decoding.
         */
		Decoder.prototype.getSupported = function () {
			return this.parsers
				.map(function (p) {
					return ({
						deviceType: p.deviceType,
						frameCode: p.frameCode
					});
				});
		};
        /**
         * Find device types
         * @param payloadString payload as hexadecimal string
         */
		Decoder.prototype.findDeviceTypes = function (payloadString) {
			// Check arguments
			if (!/^(?:[0-9a-f]{2}){2,}$/gi.test(payloadString)) {
				return [];
			}
			// Get buffer and frame code
			var payload = Buffer.from(payloadString, 'hex');
			var frameCode = payload[0];
			var deviceTypesFull = this.parsers
				.filter(function (p) { return p.frameCode === frameCode; })
				.map(function (p) { return p.deviceType; });
			return Array.from(new Set(deviceTypesFull));
		};
        /**
         * Decode given payload.
         *
         * Configuration frames with 0x10 frame code are persisted and reinjected in parsers. Pass these frames first
         * to enable device-specific decoding.
         * Example (Dry Contacts):
         *   Decoder.decode('100001016705464602'); // This frame indicates that channel 1 is configured as output
         *   Decoder.decode('4040000100000000000001'); // While decoding this data frame, channel 1 is treated as output
         *
         * @param payloadString payload as hexadecimal string
         * @param devId device ID: LoRa device EUI or Sigfox ID, leave blank if unknown
         * @param network network: lora868 or sigfox
         * @returns decoded data as JSON object
         */
		Decoder.prototype.decode = function (payloadString, devId, network) {
			if (devId === void 0) { devId = 'tmpDevId'; }
			if (network === void 0) { network = 'unknown'; }
			// Check arguments
			if (!/^(?:[0-9a-f]{2}){2,}$/gi.test(payloadString)) {
				return { type: 'Invalid' };
			}
			// Get buffer and frame code
			var payload = Buffer.from(payloadString, 'hex');
			var frameCode = payload[0];
			// Handle device type
			var deviceType;
			deviceType = this.storeDeviceType(frameCode, devId);
			if (!deviceType) {
				deviceType = this.fetchDeviceType(devId);
			}
			// Handle configuration
			var configuration;
			if (frameCode === 0x10) {
				configuration = payload;
				this.storeConfiguration(configuration, devId);
			}
			else {
				configuration = this.fetchConfiguration(devId);
			}
			// Handle specific parsing
			var activeParsers = this.getActiveParsers(deviceType, frameCode);
			var partialContents = activeParsers.map(function (p) {
				var partialContent;
				try {
					partialContent = p.parseFrame(payload, configuration, network, deviceType);
				}
				catch (error) {
					partialContent = { 'error': error.toString() };
				}
				return partialContent;
			});
			// Handle unsupported
			if (activeParsers.every(function (p) { return p.frameCode < 0; })) {
				partialContents.push({ type: 'Unsupported' });
			}
			// Merge partial contents
			var content = Object.assign.apply(Object, [{}].concat(partialContents));
			// Put 'type' at first position
			var typestr = content['type'];
			delete content['type'];
			content = Object.assign({ type: typestr }, content);
			return content;
		};
        /**
         * Set device type for given device ID.
         *
         * Gives additional information to the library to provide better decoding.
         * The library can also guess device type from passed frames in decode() method. Use this method when the frame
         * to decode does not refer to a single device type (example: 0x10 frames).
         *
         * @param deviceType device type, must be a value from getSupported() method
         * @param devId device ID: LoRa device EUI or Sigfox ID
         */
		Decoder.prototype.setDeviceType = function (deviceType, devId) {
			if (devId === void 0) { devId = 'tmpDevId'; }
			this.codecStorage.setItem(devId + ".deviceType", deviceType);
		};
        /**
         * Clear stored data for a device ID:
         *   - Device type
         *   - Configuration
         * @param devId device ID: LoRa device EUI or Sigfox ID, leave blank if unknown
         */
		Decoder.prototype.clearStoredData = function (devId) {
			var _this = this;
			if (!devId) {
				devId = 'tmpDevId';
			}
			['deviceType', 'configuration']
				.map(function (suffix) { return devId + "." + suffix; })
				.forEach(function (key) { return _this.codecStorage.removeItem(key); });
		};
        /**
         * Fetch configuration frame
         * @param devId device ID
         */
		Decoder.prototype.fetchConfiguration = function (devId) {
			if (!devId) {
				return Buffer.from('');
			}
			var value = this.codecStorage.getItem(devId + ".configuration");
			return Buffer.from(value || '', 'hex');
		};
        /**
         * Store configuration frame
         * @param payload payload
         * @param devId device ID
         */
		Decoder.prototype.storeConfiguration = function (payload, devId) {
			if (!devId) {
				return payload;
			}
			this.codecStorage.setItem(devId + ".configuration", payload.toString('hex'));
			return payload;
		};
        /**
         * Fetch device type
         * @param devId device ID
         */
		Decoder.prototype.fetchDeviceType = function (devId) {
			if (!devId) {
				return '';
			}
			return this.codecStorage.getItem(devId + ".deviceType") || '';
		};
        /**
         * Store device type
         * @param frameCode frame code
         * @param devId device ID
         */
		Decoder.prototype.storeDeviceType = function (frameCode, devId) {
			var deviceType = '';
			if (!devId) {
				return deviceType;
			}
			var matchingParsers = this.parsers.filter(function (p) { return p.deviceType !== 'any' && p.frameCode === frameCode; });
			if (matchingParsers.length === 1) {
				deviceType = matchingParsers[0].deviceType;
				this.codecStorage.setItem(devId + ".deviceType", deviceType);
			}
			return deviceType;
		};
        /**
         * Get active parsers
         * @param deviceType device type
         * @param frameCode frame code
         */
		Decoder.prototype.getActiveParsers = function (deviceType, frameCode) {
			var activeParsers = [];
			if (deviceType) {
				if (deviceType !== 'repeater') {
					// Get parsers for any device types or any frame codes
					var genericParsers = this.parsers.filter(function (p) {
						return p.deviceType === 'any' &&
							(p.frameCode < 0 || p.frameCode === frameCode);
					});
					activeParsers = activeParsers.concat(genericParsers);
				}
				// Device type is known, get parsers for given device type AND frame code
				var selectedParsers = this.parsers.filter(function (p) {
					return p.deviceType === deviceType &&
						(p.frameCode < 0 || p.frameCode === frameCode);
				});
				activeParsers = activeParsers.concat(selectedParsers);
			}
			else {
				// Get parsers for any device types or any frame codes
				activeParsers = this.parsers.filter(function (p) {
					return p.deviceType === 'any' &&
						(p.frameCode < 0 || p.frameCode === frameCode);
				});
				// Device type is not known, get parsers for the frame code IF all matches the same device type
				var selectedParsers = this.parsers.filter(function (p) { return p.frameCode === frameCode; });
				if (selectedParsers.length > 0) {
					var guessedDeviceType_1 = selectedParsers[0].deviceType;
					if (selectedParsers.every(function (p) { return p.deviceType === guessedDeviceType_1; })) {
						activeParsers = activeParsers.concat(selectedParsers);
					}
				}
			}
			// Return active parser
			return activeParsers;
		};
		return Decoder;
	}());
	codec.Decoder = Decoder;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Encoder class.
     *
     * Main class for encoding purposes.
     * Contains declaration of all required builders and encode() method (API entry point).
     *
     * See below for explanations on builders.
     */
	var Encoder = /** @class */ (function () {
		function Encoder() {
            /**
             * Builders declaration.
             *
             * Array of builder implementations that can be used by the library.
             *
             * Builders are specific handlers for encoding frame of a device type and a frame code.
             */
			this.builders = [
				new codec.Dc0x10Builder(),
				new codec.Pulse0x10Builder(),
				new codec.Repeater0x01Builder(),
				new codec.Repeater0x02Builder(),
				new codec.Repeater0x03Builder(),
				new codec.Repeater0x04Builder(),
				new codec.Repeater0x05Builder()
			];
		}
        /**
         * Get supported device types and frame codes.
         *
         * The returned pairs are available for encoding.
         */
		Encoder.prototype.getSupported = function () {
			return this.builders
				.map(function (p) {
					return ({
						deviceType: p.deviceType,
						frameCode: p.frameCode
					});
				});
		};
        /**
         * Get input data types.
         * @param deviceType device type
         * @param frameCode frame code
         * @returns a map of available input data and associated types
         */
		Encoder.prototype.getInputDataTypes = function (deviceType, frameCode) {
			var builder = this.builders.find(function (b) { return b.deviceType === deviceType && b.frameCode === frameCode; });
			if (!builder) {
				return {};
			}
			var inputdataTypes = {};
			var inputData = new builder.inputDataClass();
			for (var key in inputData) {
				if (inputData.hasOwnProperty(key)) {
					inputdataTypes[key] = typeof inputData[key];
				}
			}
			return inputdataTypes;
		};
        /**
         * Encode given arguments.
         *
         * Generates a string payload from given arguments. Data object members and associated types can be known using
         * getInputDataTypes() method.
         *
         * @param deviceType device type
         * @param frameCode frame code
         * @param network network: lora868 or sigfox
         * @param data data object: map of available input data and values
         * @returns encoded data as string
         */
		Encoder.prototype.encode = function (deviceType, frameCode, network, data) {
			if (network === void 0) { network = 'unknown'; }
			var builder = this.builders.find(function (b) { return b.deviceType === deviceType && b.frameCode === frameCode; });
			if (!builder) {
				return '';
			}
			var payload = builder.buildFrame(data || new builder.inputDataClass(), network);
			return payload.toString('hex');
		};
		return Encoder;
	}());
	codec.Encoder = Encoder;
})(codec || (codec = {}));
// CommonJS
if (typeof module !== 'undefined') {
	module.exports = codec;
}
// Test (Mocha)
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
	global.codec = codec;
}
var codec;
(function (codec) {
    /**
     * Internal codec storage
     */
	var InternalCodecStorage = /** @class */ (function () {
		function InternalCodecStorage() {
			this.store = {};
		}
		InternalCodecStorage.prototype.getItem = function (key) {
			return this.store[key];
		};
		InternalCodecStorage.prototype.removeItem = function (key) {
			delete this.store[key];
		};
		InternalCodecStorage.prototype.setItem = function (key, value) {
			this.store[key] = value;
		};
		return InternalCodecStorage;
	}());
	codec.InternalCodecStorage = InternalCodecStorage;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Comfort 0x10 (configuration) frame parser
     */
	var Comfort0x10Parser = /** @class */ (function () {
		function Comfort0x10Parser() {
			this.deviceType = 'comfort';
			this.frameCode = 0x10;
		}
		Comfort0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			// register 300: Emission period of the life frame
			// register 301: Issue period, value betwenn 0 and 65535, 0: disabling periodic transmission
			// register 320: value betwenn 1 and 65535
			// register 321: value betwenn 0 and 65535, 0: no scanning, X2s
			// reading_frequency = S321 * S320
			// sending_frequency = S321 * S320 * S301
			var appContent = {
				type: '0x10 Comfort configuration',
				'transmission_period_keep_alive_sec': payload.readUInt16BE(2) * 10,
				'number_of_historization_before_sending': payload.readUInt16BE(4),
				'number_of_sampling_before_historization': payload.readUInt16BE(6),
				'sampling_period_sec': payload.readUInt16BE(8) * 2,
				'calculated_period_recording_sec': payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
				'calculated_period_sending_sec': payload.readUInt16BE(8) * payload.readUInt16BE(6) * payload.readUInt16BE(4) * 2
			};
			return appContent;
		};
		return Comfort0x10Parser;
	}());
	codec.Comfort0x10Parser = Comfort0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Comfort 0x1f (TOR configuration) frame parser
     */
	var Comfort0x1fParser = /** @class */ (function () {
		function Comfort0x1fParser() {
			this.deviceType = 'comfort';
			this.frameCode = 0x1f;
			this.sb0x1fParser = new codec.Sb0x1fParser();
		}
		Comfort0x1fParser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x1fParser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x1f Comfort channels configuration';
			return appContent;
		};
		return Comfort0x1fParser;
	}());
	codec.Comfort0x1fParser = Comfort0x1fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Comfort 0x30 (keep alive) frame parser
     */
	var Comfort0x30Parser = /** @class */ (function () {
		function Comfort0x30Parser() {
			this.deviceType = 'comfort';
			this.frameCode = 0x30;
			this.generic0x30Parser = new codec.Generic0x30Parser();
		}
		Comfort0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.generic0x30Parser.parseFrame(payload, configuration, network);
			appContent['configuration_inconsistency'] = ((payload[1] & 0x08) !== 0) ? true : false;
			return appContent;
		};
		return Comfort0x30Parser;
	}());
	codec.Comfort0x30Parser = Comfort0x30Parser;
})(codec || (codec = {}));
var __assign = (this && this.__assign) || function () {
	__assign = Object.assign || function (t) {
		for (var s, i = 1, n = arguments.length; i < n; i++) {
			s = arguments[i];
			for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
				t[p] = s[p];
		}
		return t;
	};
	return __assign.apply(this, arguments);
};
var codec;
(function (codec) {
    /**
     * Comfort 0x4c (historic data) frame parser
     */
	var Comfort0x4cParser = /** @class */ (function () {
		function Comfort0x4cParser() {
			this.deviceType = 'comfort';
			this.frameCode = 0x4c;
		}
		Comfort0x4cParser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x4c Comfort data', 'instantaneous_temperature_celsius_degrees': payload.readInt16BE(2) / 10, 'humidity_current_percentage': payload.readUInt8(4) }, this.getHistoricDataFromPayload(payload, configuration));
			return appContent;
		};
        /**
         * Get historic data from payload
         * @param payload payload
         * @param configuration configuration
         */
		Comfort0x4cParser.prototype.getHistoricDataFromPayload = function (payload, configuration) {
			var appContent = {};
			// Loop through historic data (if present)
			for (var offset = 5; offset < payload.byteLength; offset += 3) {
				var index = (offset - 2) / 3;
				var timeText = this.getTimeText(index);
				appContent["temperature_" + timeText + "_celsius_degrees"] = payload.readInt16BE(offset) / 10;
				appContent["humidity_" + timeText + "_percentage"] = payload[offset + 2];
			}
			return appContent;
		};
        /**
         * Get reading frequency
         * @param configuration configuration
         */
		Comfort0x4cParser.prototype.getReadingFrequency = function (configuration) {
			return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
		};
        /**
         * Get time text
         * @param readingFrequency reading frequency
         * @param index index
         */
		Comfort0x4cParser.prototype.getTimeText = function (index) {
			var time = "tminus" + index;
			return time;
		};
		return Comfort0x4cParser;
	}());
	codec.Comfort0x4cParser = Comfort0x4cParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Comfort 0x4d (alarm) frame parser
     */
	var Comfort0x4dParser = /** @class */ (function () {
		function Comfort0x4dParser() {
			this.deviceType = 'comfort';
			this.frameCode = 0x4d;
		}
		Comfort0x4dParser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x4d Comfort alarm' }, this.getDataFromPayload(payload));
			return appContent;
		};
		Comfort0x4dParser.prototype.getDataFromPayload = function (payload) {
			var appContent = {};
			// Bit 4: alarm temp state (0: inactive, 1: active)
			appContent['alarm_status_temperature'] = payload.readUInt8(2) >> 4 & 1;
			// Bit 0: alarm humidity state (0: inactive, 1:active)
			appContent['alarm_status_humidity'] = payload.readUInt8(2) >> 0 & 1;
			// Temp value (en dixième de degrès)
			appContent['temperature_celsius_degrees'] = payload.readInt16BE(3) / 10;
			// Humidity value (%)
			appContent['humidity_percentage'] = payload.readUInt8(5);
			return appContent;
		};
		return Comfort0x4dParser;
	}());
	codec.Comfort0x4dParser = Comfort0x4dParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Comfort 0x51 (TOR configuration) frame parser
     */
	var Comfort0x51Parser = /** @class */ (function () {
		function Comfort0x51Parser() {
			this.deviceType = 'comfort';
			this.frameCode = 0x51;
			this.sb0x51Parser = new codec.Sb0x51Parser();
		}
		Comfort0x51Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x51Parser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x51 Comfort TOR1 alarm';
			return appContent;
		};
		return Comfort0x51Parser;
	}());
	codec.Comfort0x51Parser = Comfort0x51Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Comfort 0x52 (TOR configuration) frame parser
     */
	var Comfort0x52Parser = /** @class */ (function () {
		function Comfort0x52Parser() {
			this.deviceType = 'comfort';
			this.frameCode = 0x52;
			this.sb0x52Parser = new codec.Sb0x52Parser();
		}
		Comfort0x52Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x52Parser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x52 Comfort TOR2 alarm';
			return appContent;
		};
		return Comfort0x52Parser;
	}());
	codec.Comfort0x52Parser = Comfort0x52Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Comfort status byte parser
     */
	var ComfortStatusByteParser = /** @class */ (function () {
		function ComfortStatusByteParser() {
			this.deviceType = 'comfort';
			this.frameCode = -1;
		}
		ComfortStatusByteParser.prototype.parseFrame = function (payload, configuration) {
			var statusContent = {};
			// Status byte, applicative flags
			statusContent['configuration_inconsistency'] = ((payload[1] & 0x08) !== 0) ? true : false;
			return statusContent;
		};
		return ComfortStatusByteParser;
	}());
	codec.ComfortStatusByteParser = ComfortStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Dry Contacts 0x10 (configuration) input data
     */
	var Dc0x10InputData = /** @class */ (function () {
		function Dc0x10InputData() {
			this.channel1Output = false;
			this.channel2Output = false;
			this.channel3Output = false;
			this.channel4Output = false;
		}
		return Dc0x10InputData;
	}());
	codec.Dc0x10InputData = Dc0x10InputData;
    /**
     * Dry Contacts 0x10 (configuration) frame builder
     */
	var Dc0x10Builder = /** @class */ (function () {
		function Dc0x10Builder() {
			this.deviceType = 'dc';
			this.frameCode = 0x10;
			this.inputDataClass = Dc0x10InputData;
		}
		Dc0x10Builder.prototype.buildFrame = function (inputData, network) {
			var payload = Buffer.alloc(9);
			payload[0] = this.frameCode;
			// Channel configuration
			payload[4] = inputData.channel1Output ? 0x07 : 0x01;
			payload[5] = inputData.channel2Output ? 0x07 : 0x01;
			payload[6] = inputData.channel3Output ? 0x07 : 0x01;
			payload[7] = inputData.channel4Output ? 0x07 : 0x01;
			return payload;
		};
		return Dc0x10Builder;
	}());
	codec.Dc0x10Builder = Dc0x10Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Dry Contacts 0x10 (configuration) frame parser
     */
	var Dc0x10Parser = /** @class */ (function () {
		function Dc0x10Parser() {
			this.deviceType = 'dc';
			this.frameCode = 0x10;
		}
		Dc0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x10 Dry Contacts configuration' };
			if (payload[8] === 2) {
				// TEST mode => period = value * 20sec
				appContent['transmission_period_keep_alive_sec'] = payload[2] * 20;
				appContent['transmission_period_event_counters_sec'] = payload[3] * 20;
			}
			else {
				// PRODUCTION mode => period = value * 10min
				appContent['transmission_period_keep_alive_min'] = payload[2] * 10;
				appContent['transmission_period_event_counters_min'] = payload[3] * 10;
			}
			// Channel x configuration
			// payload[y]<3:0> => type
			// payload[y]<7:4> => waiting period duration
			// Channel A configuration
			appContent['channelA_type'] = this.getTypeText(payload[4] & 0x0f);
			appContent['channelA_waiting_period_duration'] = this.getWaitingPeriodDurationText((payload[4] & 0xf0) >> 4);
			// Channel B configuration
			appContent['channelB_type'] = this.getTypeText(payload[5] & 0x0f);
			appContent['channelB_waiting_period_duration'] = this.getWaitingPeriodDurationText((payload[5] & 0xf0) >> 4);
			// Channel C configuration
			appContent['channelC_type'] = this.getTypeText(payload[6] & 0x0f);
			appContent['channelC_waiting_period_duration'] = this.getWaitingPeriodDurationText((payload[6] & 0xf0) >> 4);
			// Channel D configuration
			appContent['channelD_type'] = this.getTypeText(payload[7] & 0x0f);
			appContent['channelD_waiting_period_duration'] = this.getWaitingPeriodDurationText((payload[7] & 0xf0) >> 4);
			// Product mode
			appContent['product_mode'] = codec.PlateformCommonUtils.getProductModeText(payload[8]);
			return appContent;
		};
        /**
         * Get Type text
         * @param value value
         */
		Dc0x10Parser.prototype.getTypeText = function (value) {
			switch (value) {
				case 0:
					return 'disabled';
				case 1:
					return 'in_periodic_mode_high_edge';
				case 2:
					return 'in_periodic_mode_low_edge';
				case 3:
					return 'in_periodic_mode_high_and_low_edge';
				case 4:
					return 'in_event_mode_high_edge';
				case 5:
					return 'in_event_mode_low_edge';
				case 6:
					return 'in_event_mode_high_and_low_edge';
				case 7:
					return 'out_default_state_1close';
				case 8:
					return 'out_default_state_0open';
				default:
					return '';
			}
		};
        /**
         * Get Waiting Period Duration text
         * @param value value
         */
		Dc0x10Parser.prototype.getWaitingPeriodDurationText = function (value) {
			switch (value) {
				case 0:
					return 'no_debounce';
				case 1:
					return '10msec';
				case 2:
					return '20msec';
				case 3:
					return '50msec';
				case 4:
					return '100msec';
				case 5:
					return '200msec';
				case 6:
					return '500msec';
				case 7:
					return '1sec';
				case 8:
					return '2sec';
				case 9:
					return '5sec';
				case 10:
					return '10sec';
				case 11:
					return '20sec';
				case 12:
					return '40sec';
				case 13:
					return '60sec';
				case 14:
					return '5min';
				default:
					return '';
			}
		};
		return Dc0x10Parser;
	}());
	codec.Dc0x10Parser = Dc0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Dry Contacts 0x30 (keep alive) frame parser
     */
	var Dc0x30Parser = /** @class */ (function () {
		function Dc0x30Parser() {
			this.deviceType = 'dc';
			this.frameCode = 0x30;
			this.generic0x30Parser = new codec.Generic0x30Parser();
		}
		Dc0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.generic0x30Parser.parseFrame(payload, configuration, network);
			appContent['command_output_done'] = ((payload[1] & 0x08) !== 0) ? true : false;
			return appContent;
		};
		return Dc0x30Parser;
	}());
	codec.Dc0x30Parser = Dc0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Dry Contacts 0x40 (data) frame parser
     */
	var Dc0x40Parser = /** @class */ (function () {
		function Dc0x40Parser() {
			this.deviceType = 'dc';
			this.frameCode = 0x40;
		}
		Dc0x40Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x40 Dry Contacts data' };
			// Channel A states
			var channelAType = configuration[4] & 0x0f;
			if (channelAType !== 0x07 && channelAType !== 0x08) {
				// Channel A type is output
				appContent['channelA_event_counter'] = payload.readUInt16BE(2);
			}
			appContent['channelA_current_state'] = Boolean(payload[10] & 0x01);
			appContent['channelA_previous_frame_state'] = Boolean(payload[10] & 0x02);
			// Channel B states
			var channelBType = configuration[5] & 0x0f;
			if (channelBType !== 0x07 && channelBType !== 0x08) {
				// Channel B type is output
				appContent['channelB_event_counter'] = payload.readUInt16BE(4);
			}
			appContent['channelB_current_state'] = Boolean(payload[10] & 0x04);
			appContent['channelB_previous_frame_state'] = Boolean(payload[10] & 0x08);
			// Channel C states
			var channelCType = configuration[6] & 0x0f;
			if (channelCType !== 0x07 && channelCType !== 0x08) {
				// Channel C type is output
				appContent['channelC_event_counter'] = payload.readUInt16BE(6);
			}
			appContent['channelC_current_state'] = Boolean(payload[10] & 0x10);
			appContent['channelC_previous_frame_state'] = Boolean(payload[10] & 0x20);
			// Channel D states
			var channelDType = configuration[7] & 0x0f;
			if (channelDType !== 0x07 && channelDType !== 0x08) {
				// Channel D type is output
				appContent['channelD_event_counter'] = payload.readUInt16BE(8);
			}
			appContent['channelD_current_state'] = Boolean(payload[10] & 0x40);
			appContent['channelD_previous_frame_state'] = Boolean(payload[10] & 0x80);
			if (configuration.byteLength < 8) {
				// Report that decoding may be inaccurate as whole configuration was not available
				appContent.partialDecoding = codec.PartialDecodingReason.MISSING_CONFIGURATION;
			}
			return appContent;
		};
		return Dc0x40Parser;
	}());
	codec.Dc0x40Parser = Dc0x40Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var number_of_sampling_before_historization_DEFAULT = 1;
    /**
     * Deltap 0x10 (configuration) input data
     */
	var Deltap0x10InputData = /** @class */ (function () {
		function Deltap0x10InputData() {
			this.readingFrequency = 600;
		}
		return Deltap0x10InputData;
	}());
	codec.Deltap0x10InputData = Deltap0x10InputData;
    /**
     * Deltap 0x10 (configuration) frame builder
     */
	var Deltap0x10Builder = /** @class */ (function () {
		function Deltap0x10Builder() {
			this.deviceType = 'deltap';
			this.frameCode = 0x10;
			this.inputDataClass = Deltap0x10InputData;
		}
		Deltap0x10Builder.prototype.buildFrame = function (inputData, network) {
			var payload = Buffer.alloc(10);
			payload[0] = this.frameCode;
			// reading frequency = acquisition period * historization period
			var dataAcquisitionPeriod = inputData.readingFrequency / number_of_sampling_before_historization_DEFAULT;
			// S320
			payload.writeUInt16BE(number_of_sampling_before_historization_DEFAULT, 6);
			// S321
			payload.writeUInt16BE(this.sanitizeUInt16(dataAcquisitionPeriod / 2), 8);
			return payload;
		};
        /**
         * Sanitize UInt16
         * @param unsafeUInt16 unsafe UInt16
         */
		Deltap0x10Builder.prototype.sanitizeUInt16 = function (unsafeUInt16) {
			return Math.max(0, Math.min(Math.trunc(unsafeUInt16), Math.pow(2, 16) - 1));
		};
		return Deltap0x10Builder;
	}());
	codec.Deltap0x10Builder = Deltap0x10Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x10 (configuration) frame parser
     */
	var Deltap0x10Parser = /** @class */ (function () {
		function Deltap0x10Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x10;
		}
		Deltap0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			// register 300: Emission period of the life frame
			// register 301: Issue period, value betwenn 0 and 65535, 0: disabling periodic transmission
			// register 320: value betwenn 1 and 65535
			// register 321: value betwenn 0 and 65535, 0: no scanning, X2s
			// reading_frequency = S321 * S320
			// sending_frequency = S321 * S320 * S301
			var appContent = {
				type: '0x10 Delta P configuration',
				'transmission_period_keep_alive_sec': payload.readUInt16BE(2) * 10,
				'number_of_historization_before_sending': payload.readUInt16BE(4),
				'number_of_sampling_before_historization': payload.readUInt16BE(6),
				'sampling_period_sec': payload.readUInt16BE(8) * 2,
				'calculated_period_recording_sec': payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
				'calculated_period_sending_sec': payload.readUInt16BE(8) * payload.readUInt16BE(6) * payload.readUInt16BE(4) * 2
			};
			return appContent;
		};
		return Deltap0x10Parser;
	}());
	codec.Deltap0x10Parser = Deltap0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x11 (0-10V configuration) frame parser
     */
	var Deltap0x11Parser = /** @class */ (function () {
		function Deltap0x11Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x11;
		}
		Deltap0x11Parser.prototype.parseFrame = function (payload, configuration, network) {
			// register 322: value betwenn 1 and 65535
			// register 323: value betwenn 0 and 65535, 0: no scanning, X2s
			// register 324: Issue period, value betwenn 0 and 65535, 0: disabling periodic transmission
			// reading_frequency = S322 * S323
			// sending_frequency = S322 * S323 * S324
			var appContent = {
				type: '0x11 Delta P 0-10V configuration',
				'number_of_sampling_before_historization': payload.readUInt16BE(2),
				'sampling_period_sec': payload.readUInt16BE(4) * 2,
				'number_of_historization_before_sending': payload.readUInt16BE(6),
				'calculated_period_recording_sec': payload.readUInt16BE(2) * payload.readUInt16BE(4) * 2,
				'calculated_period_sending_sec': payload.readUInt16BE(2) * payload.readUInt16BE(4) * payload.readUInt16BE(6) * 2
			};
			return appContent;
		};
		return Deltap0x11Parser;
	}());
	codec.Deltap0x11Parser = Deltap0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x1f (TOR configuration) frame parser
     */
	var Deltap0x1fParser = /** @class */ (function () {
		function Deltap0x1fParser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x1f;
			this.sb0x1fParser = new codec.Sb0x1fParser();
		}
		Deltap0x1fParser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x1fParser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x1f Delta P channels configuration';
			return appContent;
		};
		return Deltap0x1fParser;
	}());
	codec.Deltap0x1fParser = Deltap0x1fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x30 (keep alive) frame parser
     */
	var Deltap0x30Parser = /** @class */ (function () {
		function Deltap0x30Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x30;
			this.generic0x30Parser = new codec.Generic0x30Parser();
		}
		Deltap0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.generic0x30Parser.parseFrame(payload, configuration, network);
			appContent['configuration_inconsistency'] = ((payload[1] & 0x08) !== 0) ? true : false;
			return appContent;
		};
		return Deltap0x30Parser;
	}());
	codec.Deltap0x30Parser = Deltap0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x51 (TOR configuration) frame parser
     */
	var Deltap0x51Parser = /** @class */ (function () {
		function Deltap0x51Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x51;
			this.sb0x51Parser = new codec.Sb0x51Parser();
		}
		Deltap0x51Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x51Parser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x51 Delta P - TOR1 alarm';
			return appContent;
		};
		return Deltap0x51Parser;
	}());
	codec.Deltap0x51Parser = Deltap0x51Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x52 (TOR configuration) frame parser
     */
	var Deltap0x52Parser = /** @class */ (function () {
		function Deltap0x52Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x52;
			this.sb0x52Parser = new codec.Sb0x52Parser();
		}
		Deltap0x52Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x52Parser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x52 Delta P - TOR2 alarm';
			return appContent;
		};
		return Deltap0x52Parser;
	}());
	codec.Deltap0x52Parser = Deltap0x52Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x53 (Delta P periodic) frame parser
     */
	var Deltap0x53Parser = /** @class */ (function () {
		function Deltap0x53Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x53;
		}
		Deltap0x53Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x53 Delta P periodic data', 'instantaneous_delta_pressure_pa': payload.readInt16BE(2) }, this.getHistoricDataFromPayload(payload, configuration));
			return appContent;
		};
        /**
         * Get historic data from payload
         * @param payload payload
         * @param configuration configuration
         */
		Deltap0x53Parser.prototype.getHistoricDataFromPayload = function (payload, configuration) {
			var appContent = {};
			// Loop through historic data (if present)
			for (var offset = 4; offset < payload.byteLength; offset += 2) {
				var index = (offset - 2) / 2;
				var timeText = this.getTimeText(index);
				appContent["delta_pressure_" + timeText + "_pa"] = payload.readInt16BE(offset);
			}
			return appContent;
		};
        /**
         * Get reading frequency
         * @param configuration configuration
         */
		Deltap0x53Parser.prototype.getReadingFrequency = function (configuration) {
			return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
		};
        /**
         * Get time text
         * @param readingFrequency reading frequency
         * @param index index
         */
		Deltap0x53Parser.prototype.getTimeText = function (index) {
			var time = "tminus" + index;
			return time;
		};
		return Deltap0x53Parser;
	}());
	codec.Deltap0x53Parser = Deltap0x53Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x54 (pressure alarm) frame parser
     */
	var Deltap0x54Parser = /** @class */ (function () {
		function Deltap0x54Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x54;
		}
		Deltap0x54Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x54 Delta P alarm' }, this.getDataFromPayload(payload));
			return appContent;
		};
		Deltap0x54Parser.prototype.getDataFromPayload = function (payload) {
			var appContent = {};
			// Bit 0: alarm pressure state (0: inactive, 1: active)
			appContent['alarm_status_delta_pressure'] = payload.readUInt8(2) & 1;
			// Pressure value (en dixième de degrès)
			appContent['delta_pressure_pa'] = payload.readInt16BE(3);
			return appContent;
		};
		return Deltap0x54Parser;
	}());
	codec.Deltap0x54Parser = Deltap0x54Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x55 (periodic 0-10 V) frame parser
     */
	var Deltap0x55Parser = /** @class */ (function () {
		function Deltap0x55Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x55;
		}
		Deltap0x55Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x55 Delta P - periodic 0-10 V', 'instantaneous_voltage_mv': payload.readInt16BE(2) }, this.getHistoricDataFromPayload(payload, configuration));
			return appContent;
		};
        /**
         * Get historic data from payload
         * @param payload payload
         * @param configuration configuration
         */
		Deltap0x55Parser.prototype.getHistoricDataFromPayload = function (payload, configuration) {
			var appContent = {};
			// Loop through historic data (if present)
			for (var offset = 4; offset < payload.byteLength; offset += 2) {
				var index = (offset - 2) / 2;
				var timeText = this.getTimeText(index);
				appContent["voltage_" + timeText + "_mv"] = payload.readInt16BE(offset);
			}
			return appContent;
		};
        /**
         * Get reading frequency
         * @param configuration configuration
         */
		Deltap0x55Parser.prototype.getReadingFrequency = function (configuration) {
			return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
		};
        /**
         * Get time text
         * @param readingFrequency reading frequency
         * @param index index
         */
		Deltap0x55Parser.prototype.getTimeText = function (index) {
			var time = "tminus" + index;
			return time;
		};
		return Deltap0x55Parser;
	}());
	codec.Deltap0x55Parser = Deltap0x55Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P 0x56 (alarm 0-10 V) frame parser
     */
	var Deltap0x56Parser = /** @class */ (function () {
		function Deltap0x56Parser() {
			this.deviceType = 'deltap';
			this.frameCode = 0x56;
		}
		Deltap0x56Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x56 Delta P - alarm 0-10 V' }, this.getDataFromPayload(payload));
			return appContent;
		};
		Deltap0x56Parser.prototype.getDataFromPayload = function (payload) {
			var appContent = {};
			// Bit 0: alarm humidity state (0: inactive, 1:active)
			appContent['alarm_status_voltage'] = payload.readUInt8(2) & 1;
			// Voltage value (in mV)
			appContent['voltage_mv'] = payload.readInt16BE(3);
			return appContent;
		};
		return Deltap0x56Parser;
	}());
	codec.Deltap0x56Parser = Deltap0x56Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Delta P status byte parser
     */
	var DeltapStatusByteParser = /** @class */ (function () {
		function DeltapStatusByteParser() {
			this.deviceType = 'deltap';
			this.frameCode = -1;
		}
		DeltapStatusByteParser.prototype.parseFrame = function (payload, configuration) {
			var statusContent = {};
			// Status byte, applicative flags
			statusContent['configuration_inconsistency'] = ((payload[1] & 0x08) !== 0) ? true : false;
			return statusContent;
		};
		return DeltapStatusByteParser;
	}());
	codec.DeltapStatusByteParser = DeltapStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Generic 0x10 (configuration) frame parser
     */
	var Generic0x10Parser = /** @class */ (function () {
		function Generic0x10Parser() {
			this.deviceType = 'any';
			this.frameCode = 0x10;
		}
		Generic0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			return { type: '0x10 Configuration' };
		};
		return Generic0x10Parser;
	}());
	codec.Generic0x10Parser = Generic0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Generic 0x20 (configuration) frame parser
     */
	var Generic0x20Parser = /** @class */ (function () {
		function Generic0x20Parser() {
			this.deviceType = 'any';
			this.frameCode = 0x20;
		}
		Generic0x20Parser.prototype.parseFrame = function (payload, configuration, network, deviceType) {
			var appContent = { type: '0x20 Configuration' };
			// Content depends on network
			switch (payload.byteLength) {
				case 4:
					appContent = __assign({}, appContent, this.parseLora868(payload, deviceType));
					break;
				case 3:
					appContent = __assign({}, appContent, this.parseSigfox(payload, deviceType));
					break;
				default:
					appContent.partialDecoding = codec.PartialDecodingReason.MISSING_NETWORK;
					break;
			}
			return appContent;
		};
        /**
         * Parse LoRa 868
         * @param payload payload
         */
		Generic0x20Parser.prototype.parseLora868 = function (payload, deviceType) {
			var appContent = {};
			if (deviceType === 'temp3' || deviceType === 'pulse3') {
				appContent['loraAdr'] = Boolean(payload[2] & 0x01);
				appContent['loraProvisioningMode'] = (payload[3] === 0) ? 'ABP' : 'OTAA';
			}
			else {
				appContent['lora_adr'] = Boolean(payload[2] & 0x01);
				appContent['lora_provisioning_mode'] = (payload[3] === 0) ? 'ABP' : 'OTAA';
			}
			return appContent;
		};
        /**
         * Parse Sigfox
         * @param payload payload
         */
		Generic0x20Parser.prototype.parseSigfox = function (payload, deviceType) {
			var appContent = {};
			if (deviceType === 'temp3' || deviceType === 'pulse3') {
				appContent['sigfoxRetry'] = (payload[2] & 0x03);
			}
			else {
				appContent['sigfox_retry'] = (payload[2] & 0x03);
			}
			return appContent;
		};
		return Generic0x20Parser;
	}());
	codec.Generic0x20Parser = Generic0x20Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Generic 0x2f (downlink ACK) frame parser
     */
	var Generic0x2fParser = /** @class */ (function () {
		function Generic0x2fParser() {
			this.deviceType = 'any';
			this.frameCode = 0x2f;
		}
		Generic0x2fParser.prototype.parseFrame = function (payload, configuration, network, deviceType) {
			var appContent = { type: '0x2f Downlink ack' };
			if (deviceType === 'deltap' || deviceType === '') {
				appContent['requestStatus'] = this.getRequestStatusText(payload[2]);
			}
			else {
				appContent['downlinkFramecode'] = '0x' + payload[2].toString(16);
				appContent['requestStatus'] = this.getRequestStatusText(payload[3]);
			}
			return appContent;
		};
        /**
         * Get Type text
         * @param value value
         */
		Generic0x2fParser.prototype.getRequestStatusText = function (value) {
			switch (value) {
				case 1:
					return 'success';
				case 2:
					return 'errorGeneric';
				case 3:
					return 'errorWrongState';
				case 4:
					return 'errorInvalidRequest';
				default:
					return 'errorOtherReason';
			}
		};
		return Generic0x2fParser;
	}());
	codec.Generic0x2fParser = Generic0x2fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Generic 0x30 (keep alive) frame parser
     */
	var Generic0x30Parser = /** @class */ (function () {
		function Generic0x30Parser() {
			this.deviceType = 'any';
			this.frameCode = 0x30;
		}
		Generic0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x30 Keep alive' };
			return appContent;
		};
		return Generic0x30Parser;
	}());
	codec.Generic0x30Parser = Generic0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Generic 0x33 (Response to Set Register downlink) frame parser
     */
	var Generic0x33Parser = /** @class */ (function () {
		function Generic0x33Parser() {
			this.deviceType = 'any';
			this.frameCode = 0x33;
		}
		Generic0x33Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x33 Set register status' };
			appContent['requestStatus'] = this.getRequestStatusText(payload[2]);
			appContent['registerId'] = payload.readUInt16BE(3);
			return appContent;
		};
        /**
         * Get Type text
         * @param value value
         */
		Generic0x33Parser.prototype.getRequestStatusText = function (value) {
			switch (value) {
				case 1:
					return 'success';
				case 2:
					return 'successNoUpdate';
				case 3:
					return 'errorCoherency';
				case 4:
					return 'errorInvalidRegister';
				case 5:
					return 'errorInvalidValue';
				case 6:
					return 'errorTruncatedValue';
				case 7:
					return 'errorAccesNotAllowed';
				default:
					return 'errorOtherReason';
			}
		};
		return Generic0x33Parser;
	}());
	codec.Generic0x33Parser = Generic0x33Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Generic status byte parser
     */
	var GenericStatusByteParser = /** @class */ (function () {
		function GenericStatusByteParser() {
			this.deviceType = 'any';
			this.frameCode = -1;
		}
		GenericStatusByteParser.prototype.parseFrame = function (payload, configuration, network, deviceType) {
			var statusContent = {};
			if (deviceType === 'repeater' || deviceType === 'temp3' || deviceType === 'pulse3') {
				// custom decoding
			}
			else {
				statusContent['frame_counter'] = (payload[1] & 0xe0) >> 5;
				statusContent['hardware_error'] = Boolean((payload[1] & 0x04) !== 0);
				statusContent['low_battery'] = Boolean((payload[1] & 0x02) !== 0);
				statusContent['configuration_done'] = Boolean((payload[1] & 0x01) !== 0);
			}
			return statusContent;
		};
		return GenericStatusByteParser;
	}());
	codec.GenericStatusByteParser = GenericStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion 0x10 (configuration) frame parser
     */
	var Motion0x10Parser = /** @class */ (function () {
		function Motion0x10Parser() {
			this.deviceType = 'motion';
			this.frameCode = 0x10;
		}
		Motion0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			// calculated_period_recording_sec = S321 * S320 * 2
			// calculated_period_sending_sec = S321 * S320 * S301 * 2
			var appContent = {
				type: '0x10 Motion configuration',
				'transmission_period_keep_alive_sec': payload.readUInt16BE(2),
				'number_of_historization_before_sending': payload.readUInt16BE(4),
				'number_of_sampling_before_historization': payload.readUInt16BE(6),
				'sampling_period_sec': payload.readUInt16BE(8) * 2,
				'presence_detector_inhibition_duration_sec': payload.readUInt16BE(10) * 10,
				'calculated_period_recording_sec': payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2,
				'calculated_period_sending_sec': payload.readUInt16BE(8) * payload.readUInt16BE(6) * payload.readUInt16BE(4) * 2
			};
			return appContent;
		};
		return Motion0x10Parser;
	}());
	codec.Motion0x10Parser = Motion0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion 0x1f (TOR configuration) frame parser
     */
	var Motion0x1fParser = /** @class */ (function () {
		function Motion0x1fParser() {
			this.deviceType = 'motion';
			this.frameCode = 0x1f;
			this.sb0x1fParser = new codec.Sb0x1fParser();
		}
		Motion0x1fParser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x1fParser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x1f Motion channels configuration';
			return appContent;
		};
		return Motion0x1fParser;
	}());
	codec.Motion0x1fParser = Motion0x1fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion 0x30 (keep alive) frame parser
     */
	var Motion0x30Parser = /** @class */ (function () {
		function Motion0x30Parser() {
			this.deviceType = 'motion';
			this.frameCode = 0x30;
			this.generic0x30Parser = new codec.Generic0x30Parser();
		}
		Motion0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.generic0x30Parser.parseFrame(payload, configuration, network);
			appContent['configuration_inconsistency'] = ((payload[1] & 0x08) !== 0) ? true : false;
			return appContent;
		};
		return Motion0x30Parser;
	}());
	codec.Motion0x30Parser = Motion0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion 0x4e (historic data) frame parser
     */
	var Motion0x4eParser = /** @class */ (function () {
		function Motion0x4eParser() {
			this.deviceType = 'motion';
			this.frameCode = 0x4e;
		}
		Motion0x4eParser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x4e Motion data', 'presence_global_counter': payload.readUInt16BE(2), 'presence_current_counter': payload.readUInt16BE(4), 'luminosity_current_percentage': payload[6] }, this.getHistoricDataFromPayload(payload, configuration));
			return appContent;
		};
        /**
         * Get historic data from payload
         * @param payload payload
         * @param configuration configuration
         */
		Motion0x4eParser.prototype.getHistoricDataFromPayload = function (payload, configuration) {
			var appContent = {};
			// Loop through historic data (if present)
			for (var offset = 7; offset < payload.byteLength; offset += 3) {
				var index = (offset - 4) / 3;
				var timeText = this.getTimeText(index);
				appContent["presence_" + timeText + "_counter"] = payload.readUInt16BE(offset);
				appContent["luminosity_" + timeText + "_percentage"] = payload[offset + 2];
			}
			return appContent;
		};
        /**
         * Get reading frequency
         * @param configuration configuration
         */
		Motion0x4eParser.prototype.getReadingFrequency = function (configuration) {
			return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
		};
        /**
         * Get time text
         * @param readingFrequency reading frequency
         * @param index index
         */
		Motion0x4eParser.prototype.getTimeText = function (index) {
			var time = "tminus" + index;
			return time;
		};
		return Motion0x4eParser;
	}());
	codec.Motion0x4eParser = Motion0x4eParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion 0x4f (presence alarm) frame parser
     */
	var Motion0x4fParser = /** @class */ (function () {
		function Motion0x4fParser() {
			this.deviceType = 'motion';
			this.frameCode = 0x4f;
		}
		Motion0x4fParser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = {
				type: '0x4f Motion presence alarm',
				'presence_global_counter': payload.readUInt16BE(2),
				'presence_counter_since_last_alarm': payload.readUInt16BE(4),
			};
			return appContent;
		};
		return Motion0x4fParser;
	}());
	codec.Motion0x4fParser = Motion0x4fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion 0x50 (luminosity alarm) frame parser
     */
	var Motion0x50Parser = /** @class */ (function () {
		function Motion0x50Parser() {
			this.deviceType = 'motion';
			this.frameCode = 0x50;
		}
		Motion0x50Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = {
				type: '0x50 Motion luminosity alarm',
				'luminosity_alarm_status': this.getAlarmStatusText(Boolean(payload[2])),
				'luminosity_percentage': payload[3]
			};
			return appContent;
		};
        /**
         * Get alarm status text
         * @param status status
         */
		Motion0x50Parser.prototype.getAlarmStatusText = function (status) {
			return status ? 'active' : 'inactive';
		};
		return Motion0x50Parser;
	}());
	codec.Motion0x50Parser = Motion0x50Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion 0x51 (TOR configuration) frame parser
     */
	var Motion0x51Parser = /** @class */ (function () {
		function Motion0x51Parser() {
			this.deviceType = 'motion';
			this.frameCode = 0x51;
			this.sb0x51Parser = new codec.Sb0x51Parser();
		}
		Motion0x51Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x51Parser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x51 Motion TOR1 alarm';
			return appContent;
		};
		return Motion0x51Parser;
	}());
	codec.Motion0x51Parser = Motion0x51Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion 0x52 (TOR configuration) frame parser
     */
	var Motion0x52Parser = /** @class */ (function () {
		function Motion0x52Parser() {
			this.deviceType = 'motion';
			this.frameCode = 0x52;
			this.sb0x52Parser = new codec.Sb0x52Parser();
		}
		Motion0x52Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.sb0x52Parser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x52 Motion TOR2 alarm';
			return appContent;
		};
		return Motion0x52Parser;
	}());
	codec.Motion0x52Parser = Motion0x52Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Motion status byte parser
     */
	var MotionStatusByteParser = /** @class */ (function () {
		function MotionStatusByteParser() {
			this.deviceType = 'motion';
			this.frameCode = -1;
		}
		MotionStatusByteParser.prototype.parseFrame = function (payload, configuration) {
			var statusContent = {};
			// Status byte, applicative flags
			statusContent['configuration_inconsistency'] = ((payload[1] & 0x08) !== 0) ? true : false;
			return statusContent;
		};
		return MotionStatusByteParser;
	}());
	codec.MotionStatusByteParser = MotionStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x10 (configuration) input data
     */
	var Pulse0x10InputData = /** @class */ (function () {
		function Pulse0x10InputData() {
			this.historicLogEvery1h = false;
		}
		return Pulse0x10InputData;
	}());
	codec.Pulse0x10InputData = Pulse0x10InputData;
    /**
     * Pulse 0x10 (configuration) frame builder
     */
	var Pulse0x10Builder = /** @class */ (function () {
		function Pulse0x10Builder() {
			this.deviceType = 'pulse';
			this.frameCode = 0x10;
			this.inputDataClass = Pulse0x10InputData;
		}
		Pulse0x10Builder.prototype.buildFrame = function (inputData, network) {
			var payload = Buffer.alloc(22);
			payload[0] = this.frameCode;
			// Historic mode
			payload[6] = inputData.historicLogEvery1h ? 0x02 : 0x01;
			return payload;
		};
		return Pulse0x10Builder;
	}());
	codec.Pulse0x10Builder = Pulse0x10Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x10 (configuration) frame parser
     */
	var Pulse0x10Parser = /** @class */ (function () {
		function Pulse0x10Parser() {
			this.deviceType = 'pulse';
			this.frameCode = 0x10;
			this.pulse0x11Parser = new codec.Pulse0x11Parser();
			this.pulse0x12Parser = new codec.Pulse0x12Parser();
		}
		Pulse0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x10 Pulse configuration' };
			// Product mode
			appContent['product_mode'] = codec.PlateformCommonUtils.getProductModeText(payload[2]);
			// Infer network from frame
			var inferredNetwork = this.inferNetwork(payload.byteLength);
			// Resolve known netowrk
			var knownNetwork = network === 'unknown' ? inferredNetwork : network;
			// Transmission period
			var offset = 0;
			if (payload[8] === 2) {
				// TEST mode => period = value * 20sec
				if (knownNetwork === 'sigfox') {
					appContent['transmission_period_sec'] = payload[3] * 20;
					offset = -1; // value is on 1 byte for Sigfox, shift further payload reading
				}
				else {
					appContent['transmission_period_sec'] = payload.readUInt16BE(3) * 20;
				}
			}
			else {
				// PRODUCTION mode
				if (knownNetwork === 'sigfox') {
					// Sigfox: period = value * 10min
					appContent['transmission_period_min'] = payload[3] * 10;
					offset = -1; // value is on 1 byte for Sigfox, shift further payload reading
				}
				else {
					// LoRa 868: period = value * 1min
					appContent['transmission_period_min'] = payload.readUInt16BE(3);
				}
			}
			// Channels configuration
			appContent = __assign({}, appContent, this.parseChannelsGeneralConfiguration(payload, offset));
			// Historic mode
			appContent['historic_mode'] = this.getHistoricModeText(payload[offset + 6]);
			// Debouncing periods
			appContent['channelA_configuration_debouncing_period'] =
				this.getDebouncingPeriodText(payload[offset + 7] & 0x0f);
			appContent['channelB_configuration_debouncing_period'] =
				this.getDebouncingPeriodText((payload[offset + 7] & 0xf0) >> 4);
			// Flow calculation period
			if (payload[2] === 2) {
				// TEST mode => period = value * 20sec
				appContent['flow_calculation_period_sec'] = payload.readUInt16BE(offset + 8) * 20;
			}
			else {
				// PRODUCTION mode => period = value * 1min
				appContent['flow_calculation_period_min'] = payload.readUInt16BE(offset + 8);
			}
			if (knownNetwork === 'unknown') {
				appContent.partialDecoding = codec.PartialDecodingReason.MISSING_NETWORK;
			}
			else if (knownNetwork === 'lora868') {
				// Parse using 0x11 and 0x12 frame parsers
				appContent = __assign({}, appContent, this.parseUsing0x11(payload, knownNetwork));
				appContent = __assign({}, appContent, this.parseUsing0x12(payload, knownNetwork));
			}
			return appContent;
		};
        /**
         * Infer network
         * @param length frame length
         */
		Pulse0x10Parser.prototype.inferNetwork = function (length) {
			//            +--------------+
			//            | Frame length |
			// +----------+--------------+
			// | LoRa 868 |           22 |
			// | Sigfox   |            9 |
			// +----------+--------------+
			switch (length) {
				case 22:
					return 'lora868';
				case 9:
					return 'sigfox';
				default:
					return 'unknown';
			}
		};
        /**
         * Parse channel configuration
         * @param payload payload
         * @param offset offset
         */
		Pulse0x10Parser.prototype.parseChannelsGeneralConfiguration = function (payload, offset) {
			var appContent = {};
			// Channel A
			appContent['channelA_configuration_state'] = this.getStateText(Boolean(payload[offset + 5] & 0x01));
			appContent['channelA_configuration_type'] = this.getTypeText(Boolean(payload[offset + 5] & 0x02));
			appContent['channelA_configuration_tamper_activated'] = Boolean(payload[offset + 5] & 0x08);
			// Channel B
			appContent['channelB_configuration_state'] = this.getStateText(Boolean(payload[offset + 5] & 0x10));
			appContent['channelB_configuration_type'] = this.getTypeText(Boolean(payload[offset + 5] & 0x20));
			appContent['channelB_configuration_tamper_activated'] = Boolean(payload[offset + 5] & 0x80);
			return appContent;
		};
        /**
         * Get state text
         * @param value value
         */
		Pulse0x10Parser.prototype.getStateText = function (value) {
			return value ? 'enabled' : 'disabled';
		};
        /**
         * Get type text
         * @param value value
         */
		Pulse0x10Parser.prototype.getTypeText = function (value) {
			return value ? 'gas_pull_up_on' : 'other_pull_up_off';
		};
        /**
         * Get historic mode text
         * @param value value
         */
		Pulse0x10Parser.prototype.getHistoricModeText = function (value) {
			switch (value) {
				case 0:
					return 'no_historic';
				case 1:
					return 'historic_log_every_10min';
				case 2:
					return 'historic_log_every_1h';
				default:
					return '';
			}
		};
        /**
         * Get debouncing period text
         * @param value value
         */
		Pulse0x10Parser.prototype.getDebouncingPeriodText = function (value) {
			switch (value) {
				case 0:
					return 'no_debounce';
				case 1:
					return '1msec';
				case 2:
					return '10msec';
				case 3:
					return '20msec';
				case 4:
					return '50msec';
				case 5:
					return '100msec';
				case 6:
					return '200msec';
				case 7:
					return '500msec';
				case 8:
					return '1s';
				case 9:
					return '2s';
				case 10:
					return '5s';
				case 11:
					return '10s';
				default:
					return '';
			}
		};
        /**
         * Parse using 0x11 frame parser
         * @param payload payload
         * @param network network: unknown, lora868 or sigfox
         * @param offset offset
         */
		Pulse0x10Parser.prototype.parseUsing0x11 = function (payload, network) {
			// concat method is not supported by shim => use a basic method instead
			// var payloadWith0x11 = Buffer.concat([Buffer.from([0x11, 0x00]), payload.slice(10, 18)]);
			var payloadWith0x11 = payload.slice(8, 18);
			payloadWith0x11.writeUInt16BE(0x1100, 0);
			var appContent = this.pulse0x11Parser.parseFrame(payloadWith0x11, payload, network);
			delete appContent['type'];
			return appContent;
		};
        /**
         * Parse using 0x12 frame parser
         * @param payload payload
         * @param network network: unknown, lora868 or sigfox
         * @param offset offset
         */
		Pulse0x10Parser.prototype.parseUsing0x12 = function (payload, network) {
			// concat method is not supported by shim => use a basic method instead
			// var payloadWith0x12 = Buffer.concat([Buffer.from([0x12, 0x00]), payload.slice(18, 22)]);
			var payloadWith0x12 = payload.slice(16, 22);
			payloadWith0x12.writeUInt16BE(0x1200, 0);
			var appContent = this.pulse0x12Parser.parseFrame(payloadWith0x12, payload, network);
			delete appContent['type'];
			return appContent;
		};
		return Pulse0x10Parser;
	}());
	codec.Pulse0x10Parser = Pulse0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x11 (configuration) frame parser
     */
	var Pulse0x11Parser = /** @class */ (function () {
		function Pulse0x11Parser() {
			this.deviceType = 'pulse';
			this.frameCode = 0x11;
		}
		Pulse0x11Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x11 Pulse configuration' };
			// Overflow alarm trigger threshold
			appContent['channelA_leakage_detection_overflow_alarm_trigger_threshold'] = payload.readUInt16BE(2);
			appContent['channelB_leakage_detection_overflow_alarm_trigger_threshold'] = payload.readUInt16BE(4);
			// Leakage threshold
			appContent['channelA_leakage_detection_threshold'] = payload.readUInt16BE(6);
			appContent['channelB_leakage_detection_threshold'] = payload.readUInt16BE(8);
			return appContent;
		};
		return Pulse0x11Parser;
	}());
	codec.Pulse0x11Parser = Pulse0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x12 (configuration) frame parser
     */
	var Pulse0x12Parser = /** @class */ (function () {
		function Pulse0x12Parser() {
			this.deviceType = 'pulse';
			this.frameCode = 0x12;
		}
		Pulse0x12Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x12 Pulse configuration' };
			// Daily periods below which leakage alarm triggered
			appContent['channelA_leakage_detection_daily_periods_below_which_leakage_alarm_triggered']
				= payload.readUInt16BE(2);
			appContent['channelB_leakage_detection_daily_periods_below_which_leakage_alarm_triggered']
				= payload.readUInt16BE(4);
			return appContent;
		};
		return Pulse0x12Parser;
	}());
	codec.Pulse0x12Parser = Pulse0x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x30 (keep alive) frame parser
     */
	var Pulse0x30Parser = /** @class */ (function () {
		function Pulse0x30Parser() {
			this.deviceType = 'pulse';
			this.frameCode = 0x30;
		}
		Pulse0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x30 Pulse keep alive' };
			// Alarm states
			appContent['channelA_flow_alarm'] = Boolean(payload[2] & 0x01);
			appContent['channelB_flow_alarm'] = Boolean(payload[2] & 0x02);
			appContent['channelA_fraud_alarm'] = Boolean(payload[2] & 0x04);
			appContent['channelB_fraud_alarm'] = Boolean(payload[2] & 0x08);
			appContent['channelA_leakage_alarm'] = Boolean(payload[2] & 0x10);
			appContent['channelB_leakage_alarm'] = Boolean(payload[2] & 0x20);
			// Max/min measured flows
			appContent['channelA_last_24h_max_flow'] = payload.readUInt16BE(3);
			appContent['channelB_last_24h_max_flow'] = payload.readUInt16BE(5);
			appContent['channelA_last_24h_min_flow'] = payload.readUInt16BE(7);
			appContent['channelB_last_24h_min_flow'] = payload.readUInt16BE(9);
			return appContent;
		};
		return Pulse0x30Parser;
	}());
	codec.Pulse0x30Parser = Pulse0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x46 (data) frame parser
     */
	var Pulse0x46Parser = /** @class */ (function () {
		function Pulse0x46Parser() {
			this.deviceType = 'pulse';
			this.frameCode = 0x46;
		}
		Pulse0x46Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x46 Pulse data' };
			// Current indexes
			appContent['channelA_index'] = payload.readUInt32BE(2);
			appContent['channelB_index'] = payload.readUInt32BE(6);
			return appContent;
		};
		return Pulse0x46Parser;
	}());
	codec.Pulse0x46Parser = Pulse0x46Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x47 (alarm) frame parser
     */
	var Pulse0x47Parser = /** @class */ (function () {
		function Pulse0x47Parser() {
			this.deviceType = 'pulse';
			this.frameCode = 0x47;
		}
		Pulse0x47Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x47 Pulse alarm' };
			// Flows when overflow occured
			appContent['channelA_flow'] = payload.readUInt16BE(2);
			appContent['channelB_flow'] = payload.readUInt16BE(4);
			return appContent;
		};
		return Pulse0x47Parser;
	}());
	codec.Pulse0x47Parser = Pulse0x47Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x48 (historic data) frame parser
     */
	var Pulse0x48Parser = /** @class */ (function () {
		function Pulse0x48Parser() {
			this.deviceType = 'pulse';
			this.frameCode = 0x48;
		}
		Pulse0x48Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x48 Pulse historic data' };
			// Frame index
			var frameIndex = payload[2];
			appContent['frame_index'] = frameIndex;
			// Infer network and historic configuration from frame
			var _a = this.inferNetworkAndHistoricCfg(frameIndex, payload.byteLength), inferredNetwork = _a.inferredNetwork, inferredHistoricCfg = _a.inferredHistoricCfg;
			// Resolve known netowrk
			var knownNetwork = network === 'unknown' ? inferredNetwork : network;
			var historicConfiguration;
			if (configuration[6]) {
				// Configuration is known, read historic configuration
				historicConfiguration = (configuration[6] & 0x03);
			}
			else {
				// Configuration is not known, use inferred historic configuration
				historicConfiguration = inferredHistoricCfg;
			}
			if (historicConfiguration < 0) {
				// Historic configuration could not be inferred
				appContent.partialDecoding = codec.PartialDecodingReason.MISSING_CONFIGURATION;
				return appContent;
			}
			// Parse indexes
			appContent = __assign({}, appContent, this.parseIndexes(payload, frameIndex, historicConfiguration));
			if (knownNetwork === 'unknown') {
				// Network could not be inferred
				appContent.partialDecoding = codec.PartialDecodingReason.MISSING_NETWORK;
				return appContent;
			}
			// Parse deltas
			appContent = __assign({}, appContent, this.parseDeltas(payload, knownNetwork, frameIndex, historicConfiguration));
			return appContent;
		};
        /**
         * Parse indexes
         * @param payload payload
         * @param frameIndex frame index
         * @param historicConfiguration historic configuration
         */
		Pulse0x48Parser.prototype.parseIndexes = function (payload, frameIndex, historicConfiguration) {
			var appContent = {};
			if (frameIndex !== 0) {
				// Indexes are not in this frame
				return appContent;
			}
			// Index values
			var time = historicConfiguration === 0x1 ? '10min' : '1h';
			appContent["channelA_index_" + time + "_after_previous_frame"] = payload.readUInt32BE(3);
			appContent["channelB_index_" + time + "_after_previous_frame"] = payload.readUInt32BE(7);
			return appContent;
		};
        /**
         * Parse deltas
         * @param payload payload
         * @param network network: lora868 or sigfox
         * @param frameIndex frame index
         * @param historicConfiguration historic configuration
         */
		Pulse0x48Parser.prototype.parseDeltas = function (payload, network, frameIndex, historicConfiguration) {
			var appContent = {};
			// Example for 1h history (frame 1/1)
			// +----------------------------------------------------+---------------+
			// |                        Key                         | Data location |
			// +----------------------------------------------------+---------------+
			// | channelA_delta_10min_to_20min_after_previous_frame | bytes 11-12   |
			// | channelB_delta_10min_to_20min_after_previous_frame | bytes 13-14   |
			// | channelA_delta_20min_to_30min_after_previous_frame | bytes 15-16   |
			// | ...                                                | ...           |
			// | channelA_delta_50min_to_60min_after_previous_frame | bytes 27-28   |
			// | channelB_delta_50min_to_60min_after_previous_frame | bytes 29-30   |
			// +----------------------------------------------------+---------------+
			// Example for 1d history (frame 2/3)
			// +------------------------------------------------+---------------+
			// |                      Key                       | Data location |
			// +------------------------------------------------+---------------+
			// | channelA_delta_11h_to_12h_after_previous_frame | bytes 3-4     |
			// | channelB_delta_11h_to_12h_after_previous_frame | bytes 5-6     |
			// | channelA_delta_12h_to_13h_after_previous_frame | bytes 7-8     |
			// | ...                                            | ...           |
			// | channelA_delta_22h_to_23h_after_previous_frame | bytes 47-48   |
			// | channelB_delta_22h_to_23h_after_previous_frame | bytes 49-50   |
			// +------------------------------------------------+---------------+
			// Delta values
			var start = frameIndex === 0 ? 11 : 3;
			for (var offset = start; offset < payload.byteLength; offset += 4) {
				var intervalText = '';
				if (historicConfiguration === 0x1) {
					// Step is 10min
					var base = this.getBaseFor1hHistory(network, frameIndex);
					var intervalStart = base + (offset - start) / 4 * 10;
					intervalText = intervalStart + "min_to_" + (intervalStart + 10) + "min";
				}
				else {
					// Step is 1h
					var base = this.getBaseFor1dHistory(network, frameIndex);
					var intervalStart = base + (offset - start) / 4;
					intervalText = intervalStart + "h_to_" + (intervalStart + 1) + "h";
				}
				appContent["channelA_delta_" + intervalText + "_after_previous_frame"] = payload.readUInt16BE(offset);
				appContent["channelB_delta_" + intervalText + "_after_previous_frame"] = payload.readUInt16BE(offset + 2);
			}
			return appContent;
		};
        /**
         * Infer network and historic configuration
         * @param payload payload
         * @param configuration configuration
         */
		Pulse0x48Parser.prototype.inferNetworkAndHistoricCfg = function (frameIndex, byteLength) {
			// +-----------------------+-------------------+-----------------------------+
			// | Frame count [lengths] | 1h history (0x1)  |      1d history (0x2)       |
			// +-----------------------+-------------------+-----------------------------+
			// | LoRa 868              | 1 [31]            | 3  [51, 51, 7]              |
			// | Sigfox                | 4 [11, 11, 11, 7] | 13 [11, 11, 11, ..., 11, 7] |
			// +-----------------------+-------------------+-----------------------------+
			if (byteLength === 31) {
				// LoRa 868 1h history
				return { inferredNetwork: 'lora868', inferredHistoricCfg: 0x1 };
			}
			else if (byteLength === 51 || (frameIndex === 2 && byteLength === 7)) {
				// LoRa 868 1d history
				return { inferredNetwork: 'lora868', inferredHistoricCfg: 0x2 };
			}
			else if (frameIndex === 3 && byteLength === 7) {
				// Sigfox 1h history
				return { inferredNetwork: 'sigfox', inferredHistoricCfg: 0x1 };
			}
			else if (frameIndex >= 3) {
				// Sigfox 1d history
				return { inferredNetwork: 'sigfox', inferredHistoricCfg: 0x2 };
			}
			else if (byteLength === 11) {
				// Sigfox
				return { inferredNetwork: 'sigfox', inferredHistoricCfg: -1 };
			}
			else {
				// Unknown
				return { inferredNetwork: 'unknown', inferredHistoricCfg: -1 };
			}
		};
        /**
         * Get base for 1h history
         * @param frameIndex frame index
         * @param network network: lora868 or sigfox
         */
		Pulse0x48Parser.prototype.getBaseFor1hHistory = function (network, frameIndex) {
			// +---------------------------+----+----+----+----+
			// | Base for 1h history (0x1) | 0  | 1  | 2  | 3  |
			// +---------------------------+----+----+----+----+
			// | LoRa 868                  | 10 |    |    |    |
			// | Sigfox                    | 10 | 10 | 30 | 50 |
			// +---------------------------+----+----+----+----+
			switch (network) {
				case 'sigfox':
					return [10, 10, 30, 50][frameIndex];
				// case 'lora868':
				default:
					return 10;
			}
		};
        /**
         * Get base for 1d history
         * @param frameIndex frame index
         * @param network network: lora868 or sigfox
         */
		Pulse0x48Parser.prototype.getBaseFor1dHistory = function (network, frameIndex) {
			// +---------------------------+---+----+----+---+---+---+----+----+----+----+----+----+----+
			// | Base for 1d history (0x2) | 0 | 1  | 2  | 3 | 4 | 5 | 6  | 7  | 8  | 9  | 10 | 11 | 12 |
			// +---------------------------+---+----+----+---+---+---+----+----+----+----+----+----+----+
			// | LoRa 868                  | 1 | 11 | 23 |   |   |   |    |    |    |    |    |    |    |
			// | Sigfox                    | 1 |  1 |  3 | 5 | 7 | 9 | 11 | 13 | 15 | 17 | 19 | 21 | 23 |
			// +---------------------------+---+----+----+---+---+---+----+----+----+----+----+----+----+
			switch (network) {
				case 'sigfox':
					return [1, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23][frameIndex];
				// case 'lora868':
				default:
					return [1, 11, 13][frameIndex];
			}
		};
		return Pulse0x48Parser;
	}());
	codec.Pulse0x48Parser = Pulse0x48Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 3 0x10 (configuration) frame parser
     */
	var PulseV30x10Parser = /** @class */ (function () {
		function PulseV30x10Parser() {
			this.deviceType = 'pulse3';
			this.frameCode = 0x10;
		}
		PulseV30x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x10 Pulse 3 configuration' };
			var contentA = {};
			var contentB = {};
			// Product mode
			appContent['productMode'] = codec.PlateformCommonUtils.getProductModeText(payload[2]);
			// Transmission period
			appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(3);
			appContent['samplingPeriod'] = { 'unit': 's', 'value': payload.readUInt16BE(6) * 2 };
			appContent['calculatedSendingPeriod'] = {
				'unit': 's',
				'value': payload.readUInt16BE(3) * payload.readUInt16BE(6) * 2
			};
			// Flow calculation period
			if (payload[2] === 2) {
				// TEST mode => period = value * 20sec
				appContent['flowCalculationPeriod'] = { 'unit': 's', 'value': payload.readUInt16BE(9) * 20 };
			}
			else {
				// PRODUCTION mode => period = value * 1min
				appContent['flowCalculationPeriod'] = { 'unit': 'm', 'value': payload.readUInt16BE(9) };
			}
			// LoRa frame (28 bytes) / SFX (11 bytes)
			if (payload.byteLength === 28) {
				appContent['redundantSamples'] = payload.readUInt8(27);
			}
			// Channels A configuration
			contentA['state'] = this.getStateText(Boolean(payload[5] & 0x01));
			contentA['type'] = this.getTypeText(Boolean(payload[5] & 0x02));
			contentA['debouncingPeriod'] = {
				'unit': 'ms', 'value': this.getDebouncingPeriodText(payload[8] & 0x0f)
			};
			// LoRa frame (28 bytes) / SFX (11 bytes)
			if (payload.byteLength === 28) {
				contentA['leakageDetectionOverflowAlarmTriggerThreshold'] = payload.readUInt16BE(11);
				contentA['leakageDetectionThreshold'] = payload.readUInt16BE(15);
				contentA['leakageDetectionDailyPeriodsBelowWhichLeakageAlarmTriggered']
					= payload.readUInt16BE(19);
				contentA['tamperActivated'] = Boolean(payload[5] & 0x08);
				contentA['samplePeriodForTamperDetection'] = payload.readUInt8(23);
				contentA['tamperThreshold'] = payload.readUInt8(24);
			}
			appContent['channelA'] = contentA;
			// Channel B configuration
			contentB['state'] = this.getStateText(Boolean(payload[5] & 0x10));
			contentB['type'] = this.getTypeText(Boolean(payload[5] & 0x20));
			contentB['debouncingPeriod'] = {
				'unit': 'ms', 'value': this.getDebouncingPeriodText((payload[8] & 0xf0) >> 4)
			};
			// LoRa frame (28 bytes) / SFX (11 bytes)
			if (payload.byteLength === 28) {
				contentB['leakageDetectionOverflowAlarmTriggerThreshold'] = payload.readUInt16BE(13);
				contentB['leakageDetectionThreshold'] = payload.readUInt16BE(17);
				contentB['leakageDetectionDailyPeriodsBelowWhichLeakageAlarmTriggered']
					= payload.readUInt16BE(21);
				contentB['tamperActivated'] = Boolean(payload[5] & 0x80);
				contentB['samplePeriodForTamperDetection'] = payload.readUInt8(25);
				contentB['tamperThreshold'] = payload.readUInt8(26);
			}
			appContent['channelB'] = contentB;
			return appContent;
		};
        /**
         * Get state text
         * @param value value
         */
		PulseV30x10Parser.prototype.getStateText = function (value) {
			return value ? 'enabled' : 'disabled';
		};
        /**
         * Get type text
         * @param value value
         */
		PulseV30x10Parser.prototype.getTypeText = function (value) {
			return value ? 'gasPullUpOn' : 'otherPullUpOff';
		};
        /**
         * Get debouncing period text
         * @param value value
         */
		PulseV30x10Parser.prototype.getDebouncingPeriodText = function (value) {
			switch (value) {
				case 0:
					return '0';
				case 1:
					return '1';
				case 2:
					return '10';
				case 3:
					return '20';
				case 4:
					return '50';
				case 5:
					return '100';
				case 6:
					return '200';
				case 7:
					return '500';
				case 8:
					return '1000';
				case 9:
					return '2000';
				case 10:
					return '5000';
				case 11:
					return '10000';
				default:
					return '0';
			}
		};
		return PulseV30x10Parser;
	}());
	codec.PulseV30x10Parser = PulseV30x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 0x11 (configuration) frame parser
     */
	var PulseV30x11Parser = /** @class */ (function () {
		function PulseV30x11Parser() {
			this.deviceType = 'pulse3';
			this.frameCode = 0x11;
		}
		PulseV30x11Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x11 Pulse 3 configuration' };
			var contentA = {};
			var contentB = {};
			// Overflow alarm trigger threshold
			contentA['leakageDetectionOverflowAlarmTriggerThreshold'] = payload.readUInt16BE(2);
			contentB['leakageDetectionOverflowAlarmTriggerThreshold'] = payload.readUInt16BE(4);
			// Leakage threshold
			contentA['leakageDetectionThreshold'] = payload.readUInt16BE(6);
			contentB['leakageDetectionThreshold'] = payload.readUInt16BE(8);
			appContent['channelA'] = contentA;
			appContent['channelB'] = contentB;
			return appContent;
		};
		return PulseV30x11Parser;
	}());
	codec.PulseV30x11Parser = PulseV30x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 3 0x12 (configuration) frame parser
     */
	var PulseV30x12Parser = /** @class */ (function () {
		function PulseV30x12Parser() {
			this.deviceType = 'pulse3';
			this.frameCode = 0x12;
		}
		PulseV30x12Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x12 Pulse 3 configuration' };
			var contentA = {};
			var contentB = {};
			appContent['redundantSamples'] = payload.readUInt8(10);
			// Daily periods below which leakage alarm triggered
			contentA['leakageDetectionDailyPeriodsBelowWhichLeakageAlarmTriggered']
				= payload.readUInt16BE(2);
			contentB['leakageDetectionDailyPeriodsBelowWhichLeakageAlarmTriggered']
				= payload.readUInt16BE(4);
			contentA['samplePeriodForTamperDetection'] = payload.readUInt8(6);
			contentA['tamperThreshold'] = payload.readUInt8(7);
			contentB['samplePeriodForTamperDetection'] = payload.readUInt8(8);
			contentB['tamperThreshold'] = payload.readUInt8(9);
			appContent['channelA'] = contentA;
			appContent['channelB'] = contentB;
			return appContent;
		};
		return PulseV30x12Parser;
	}());
	codec.PulseV30x12Parser = PulseV30x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 3 0x30 (keep alive) frame parser
     */
	var PulseV30x30Parser = /** @class */ (function () {
		function PulseV30x30Parser() {
			this.deviceType = 'pulse3';
			this.frameCode = 0x30;
		}
		PulseV30x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x30 Pulse 3 keep alive' };
			var contentA = {};
			var contentB = {};
			// Alarm states
			contentA['flowAlarm'] = Boolean(payload[2] & 0x01);
			contentB['flowAlarm'] = Boolean(payload[2] & 0x02);
			contentA['tamperAlarm'] = Boolean(payload[2] & 0x04);
			contentB['tamperAlarm'] = Boolean(payload[2] & 0x08);
			contentA['leakageAlarm'] = Boolean(payload[2] & 0x10);
			contentB['leakageAlarm'] = Boolean(payload[2] & 0x20);
			// Max/min measured flows
			contentA['last24hMaxFlow'] = payload.readUInt16BE(3);
			contentB['last24hMaxFlow'] = payload.readUInt16BE(5);
			contentA['last24hMinFlow'] = payload.readUInt16BE(7);
			contentB['last24hMinFlow'] = payload.readUInt16BE(9);
			appContent['channelA'] = contentA;
			appContent['channelB'] = contentB;
			return appContent;
		};
		return PulseV30x30Parser;
	}());
	codec.PulseV30x30Parser = PulseV30x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 3 0x46 (data) frame parser
     */
	var PulseV30x46Parser = /** @class */ (function () {
		function PulseV30x46Parser() {
			this.deviceType = 'pulse3';
			this.frameCode = 0x46;
		}
		PulseV30x46Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x46 Pulse 3 data' };
			// Current indexes [Channel A, Channel B]
			appContent['counterValues'] = [payload.readUInt32BE(2), payload.readUInt32BE(6)];
			return appContent;
		};
		return PulseV30x46Parser;
	}());
	codec.PulseV30x46Parser = PulseV30x46Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 3 0x47 (alarm) frame parser
     */
	var PulseV30x47Parser = /** @class */ (function () {
		function PulseV30x47Parser() {
			this.deviceType = 'pulse3';
			this.frameCode = 0x47;
		}
		PulseV30x47Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x47 Pulse 3 alarm' };
			// Flows when overflow occured [Channel A, Channel B]
			appContent['flowValues'] = [payload.readUInt16BE(2), payload.readUInt16BE(4)];
			return appContent;
		};
		return PulseV30x47Parser;
	}());
	codec.PulseV30x47Parser = PulseV30x47Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 3 periodic data  frame parser
     */
	var PulseV30x5aParser = /** @class */ (function () {
		function PulseV30x5aParser() {
			this.deviceType = 'pulse3';
			this.frameCode = 0x5a;
		}
		PulseV30x5aParser.prototype.parseFrame = function (payload, configuration, network) {
			var absCounterValue = payload.readUInt32BE(2);
			var appContent = { type: '0x5a Pulse 3 data - channel A' };
			var values = [absCounterValue];
			// Loop through historic data [t=0, t-1, t-2,...]
			for (var offset = 6; offset < payload.byteLength; offset += 2) {
				absCounterValue -= payload.readInt16BE(offset);
				values.push(absCounterValue);
			}
			appContent['counterValues'] = values;
			return appContent;
		};
        /**
         * Get reading frequency
         * @param configuration configuration
         */
		PulseV30x5aParser.prototype.getReadingFrequency = function (configuration) {
			return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
		};
		return PulseV30x5aParser;
	}());
	codec.PulseV30x5aParser = PulseV30x5aParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 3 periodic data frame parser
     */
	var PulseV30x5bParser = /** @class */ (function () {
		function PulseV30x5bParser() {
			this.deviceType = 'pulse3';
			this.frameCode = 0x5b;
		}
		PulseV30x5bParser.prototype.parseFrame = function (payload, configuration, network) {
			var absCounterValue = payload.readUInt32BE(2);
			var appContent = { type: '0x5b Pulse 3 data - channel B' };
			var values = [absCounterValue];
			// Loop through historic data [t=0, t-1, t-2,...]
			for (var offset = 6; offset < payload.byteLength; offset += 2) {
				absCounterValue -= payload.readInt16BE(offset);
				values.push(absCounterValue);
			}
			appContent['counterValues'] = values;
			return appContent;
		};
        /**
         * Get reading frequency
         * @param configuration configuration
         */
		PulseV30x5bParser.prototype.getReadingFrequency = function (configuration) {
			return configuration.byteLength > 0 ? configuration.readUInt16BE(8) * configuration.readUInt16BE(6) * 2 : null;
		};
		return PulseV30x5bParser;
	}());
	codec.PulseV30x5bParser = PulseV30x5bParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Pulse 3 status byte parser
     */
	var PulseV3StatusByteParser = /** @class */ (function () {
		function PulseV3StatusByteParser() {
			this.deviceType = 'pulse3';
			this.frameCode = -1;
		}
		PulseV3StatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
			var statusContent = {};
			statusContent['frameCounter'] = (payload[1] & 0xe0) >> 5;
			statusContent['hardwareError'] = ((payload[1] & 0x04) !== 0) ? true : false;
			statusContent['lowBattery'] = ((payload[1] & 0x02) !== 0) ? true : false;
			statusContent['configurationDone'] = ((payload[1] & 0x01) !== 0) ? true : false;
			// Status byte, applicative flags
			statusContent['configurationInconsistency'] = ((payload[1] & 0x08) !== 0) ? true : false;
			return { 'status': statusContent };
		};
		return PulseV3StatusByteParser;
	}());
	codec.PulseV3StatusByteParser = PulseV3StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var Repeater0x01InputData = /** @class */ (function () {
		function Repeater0x01InputData() {
			// Accepted values are:
			// 0 retour en mode PARK
			// 1 retour en mode installation auto
			// 2 retour en mode opération, WL vide, rafraichissement de la WL à chaque trame OoB
			this.return_mode = 0;
		}
		return Repeater0x01InputData;
	}());
	codec.Repeater0x01InputData = Repeater0x01InputData;
    /**
     * Repeater 0x01 frame builder
     */
	var Repeater0x01Builder = /** @class */ (function () {
		function Repeater0x01Builder() {
			this.deviceType = 'repeater';
			this.frameCode = 0x01;
			this.inputDataClass = Repeater0x01InputData;
		}
		Repeater0x01Builder.prototype.buildFrame = function (inputData, network) {
			var payload = Buffer.alloc(8);
			payload[0] = this.frameCode;
			payload.writeUInt8(inputData.return_mode, 1);
			return payload;
		};
		return Repeater0x01Builder;
	}());
	codec.Repeater0x01Builder = Repeater0x01Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Repeater 0x01 frame parser
     */
	var Repeater0x01Parser = /** @class */ (function () {
		function Repeater0x01Parser() {
			this.deviceType = 'repeater';
			this.frameCode = 0x01;
		}
		Repeater0x01Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x01 Repeater WL add' }, this.getDataFromPayload(payload));
			return appContent;
		};
		Repeater0x01Parser.prototype.getDataFromPayload = function (payload) {
			var appContent = {};
			codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
			return appContent;
		};
		return Repeater0x01Parser;
	}());
	codec.Repeater0x01Parser = Repeater0x01Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var Repeater0x02InputData = /** @class */ (function () {
		function Repeater0x02InputData() {
			// wl_activation accepted values are 0x00 or 0x01
			this.wl_activation = 0x00;
			this.id = 0;
		}
		return Repeater0x02InputData;
	}());
	codec.Repeater0x02InputData = Repeater0x02InputData;
    /**
     * Repeater 0x02 frame builder
     */
	var Repeater0x02Builder = /** @class */ (function () {
		function Repeater0x02Builder() {
			this.deviceType = 'repeater';
			this.frameCode = 0x02;
			this.inputDataClass = Repeater0x02InputData;
		}
		Repeater0x02Builder.prototype.buildFrame = function (inputData, network) {
			var payload = Buffer.alloc(8);
			payload[0] = this.frameCode;
			payload.writeUInt8(inputData.wl_activation, 1);
			payload.writeUInt32BE(inputData.id, 1);
			return payload;
		};
		return Repeater0x02Builder;
	}());
	codec.Repeater0x02Builder = Repeater0x02Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Repeater 0x02 frame parser
     */
	var Repeater0x02Parser = /** @class */ (function () {
		function Repeater0x02Parser() {
			this.deviceType = 'repeater';
			this.frameCode = 0x02;
		}
		Repeater0x02Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x02 Repeater WL modification' }, this.getDataFromPayload(payload));
			return appContent;
		};
		Repeater0x02Parser.prototype.getDataFromPayload = function (payload) {
			var appContent = {};
			codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
			appContent['number_of_id_in_wl'] = payload.readUInt8(2);
			return appContent;
		};
		return Repeater0x02Parser;
	}());
	codec.Repeater0x02Parser = Repeater0x02Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var Repeater0x03InputData = /** @class */ (function () {
		function Repeater0x03InputData() {
			// wl_validation accepted values are 0x00 or 0x01
			this.wl_validation = 0x00;
			this.id = 0;
		}
		return Repeater0x03InputData;
	}());
	codec.Repeater0x03InputData = Repeater0x03InputData;
    /**
     * Repeater 0x03 frame builder
     */
	var Repeater0x03Builder = /** @class */ (function () {
		function Repeater0x03Builder() {
			this.deviceType = 'repeater';
			this.frameCode = 0x03;
			this.inputDataClass = Repeater0x03InputData;
		}
		Repeater0x03Builder.prototype.buildFrame = function (inputData, network) {
			var payload = Buffer.alloc(8);
			payload[0] = this.frameCode;
			payload.writeUInt8(inputData.wl_validation, 1);
			payload.writeUInt32BE(inputData.id, 2);
			return payload;
		};
		return Repeater0x03Builder;
	}());
	codec.Repeater0x03Builder = Repeater0x03Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Repeater 0x02 frame parser
     */
	var Repeater0x03Parser = /** @class */ (function () {
		function Repeater0x03Parser() {
			this.deviceType = 'repeater';
			this.frameCode = 0x03;
		}
		Repeater0x03Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x03 Repeater DL confirmation' }, this.getDataFromPayload(payload));
			return appContent;
		};
		Repeater0x03Parser.prototype.getDataFromPayload = function (payload) {
			var appContent = {};
			codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
			appContent['downlink_code'] = codec.RepeaterHelper.getDownlinkDescriptionForCode(payload.readUInt8(2));
			appContent['downlink_error_code'] = codec.RepeaterHelper.getErrorDescriptionForCode(payload.readUInt8(3));
			return appContent;
		};
		return Repeater0x03Parser;
	}());
	codec.Repeater0x03Parser = Repeater0x03Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var Repeater0x04InputData = /** @class */ (function () {
		function Repeater0x04InputData() {
			this.S300 = 1; // 01- 31
			this.S303 = 0; // 00 ou 02
			this.S304 = 0; // 00/01/02
			this.S306 = 0; // 00 ou 02
		}
		return Repeater0x04InputData;
	}());
	codec.Repeater0x04InputData = Repeater0x04InputData;
    /**
     * Repeater 0x04 frame builder
     */
	var Repeater0x04Builder = /** @class */ (function () {
		function Repeater0x04Builder() {
			this.deviceType = 'repeater';
			this.frameCode = 0x04;
			this.inputDataClass = Repeater0x04InputData;
		}
		Repeater0x04Builder.prototype.buildFrame = function (inputData, network) {
			var payload = Buffer.alloc(8);
			payload[0] = this.frameCode;
			payload.writeUInt8(inputData.S300, 1);
			payload.writeUInt8(inputData.S303, 2);
			payload.writeUInt8(inputData.S304, 3);
			payload.writeUInt8(inputData.S306, 4);
			return payload;
		};
		Repeater0x04Builder.prototype.getFirstIds = function (ids) {
			return ids.filter(function (id) { return id >= 8; });
		};
		Repeater0x04Builder.prototype.getLastIds = function (ids) {
			return ids.filter(function (id) { return id < 8; });
		};
		Repeater0x04Builder.prototype.getByteFromIdsList = function (ids) {
			var intArray = Buffer.alloc(8);
			ids.forEach(function (id, idx) { return intArray[idx] = id; });
			return intArray.readUInt8(0);
		};
		return Repeater0x04Builder;
	}());
	codec.Repeater0x04Builder = Repeater0x04Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Repeater 0x04 frame parser
     */
	var Repeater0x04Parser = /** @class */ (function () {
		function Repeater0x04Parser() {
			this.deviceType = 'repeater';
			this.frameCode = 0x04;
		}
		Repeater0x04Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x04 White List confirmation' }, this.getDataFromPayload(payload));
			return appContent;
		};
		Repeater0x04Parser.prototype.getDataFromPayload = function (payload) {
			var appContent = {};
			codec.RepeaterHelper.getUPStatusFromPayload(payload, appContent);
			appContent['number_of_id_in_wl'] = payload.readUInt8(2);
			return appContent;
		};
		return Repeater0x04Parser;
	}());
	codec.Repeater0x04Parser = Repeater0x04Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var Repeater0x05InputData = /** @class */ (function () {
		function Repeater0x05InputData() {
		}
		return Repeater0x05InputData;
	}());
	codec.Repeater0x05InputData = Repeater0x05InputData;
    /**
     * Repeater 0x05 frame builder
     */
	var Repeater0x05Builder = /** @class */ (function () {
		function Repeater0x05Builder() {
			this.deviceType = 'repeater';
			this.frameCode = 0x05;
			this.inputDataClass = Repeater0x05InputData;
		}
		Repeater0x05Builder.prototype.buildFrame = function (inputData, network) {
			var payload = Buffer.alloc(8);
			payload[0] = this.frameCode;
			return payload;
		};
		return Repeater0x05Builder;
	}());
	codec.Repeater0x05Builder = Repeater0x05Builder;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var errorCode = {
		0x00: '0x00 The action has been correctly realized',
		0x0A: '0x0A Uplink code is invalid',
		0x0B: '0x0B Harware error, please contact adeunis support',
		0x0C: '0x0C Callback error',
		0x0D: '0x0D Generic error',
		0x01: '0x01 White List already empty',
		0x02: '0x02 White List not erased',
		0x03: '0x03 White List is empty, repeater switch into OPERATION with “auto-record” mode',
		0x04: '0x04 ID not found in the White List',
		0x05: '0x05 White List is full, “add an ID” not possible',
		0x06: '0x06 ID already existing in the White List',
		0x07: '0x07 No ID repeated, repeater stay into OPERATION with “auto-record” mode',
		0x08: '0x08 A White List is already existing, use “Suppress all IDs from White List” frame before',
		0x11: '0x11 Error with S300 configuration',
		0x12: '0x12 Error with S303 configuration',
		0x13: '0x13 Error with S300, S303 configuration',
		0x14: '0x14 Error with S304 configuration',
		0x15: '0x15 Error with S300, S304 configuration',
		0x16: '0x16 Error with S303, S304 configuration',
		0x17: '0x17 Error with S300, S303, S304 configuration',
		0x18: '0x18 Error with S306 configuration',
		0x19: '0x19 Error with S300, S306 configuration',
		0x1A: '0x1A Error with S303, S306 configuration',
		0x1B: '0x1B Error with S300, S303, S306 configuration',
		0x1C: '0x1C Error with S304, S306 configuration',
		0x1D: '0x1D Error with S300, S304, S306 configuration',
		0x1E: '0x1E Error with S303, S304, S306 configuration',
		0x1F: '0x1F Error with S300, S303, S304, S306 configuration'
	};
	var dlCode = {
		0x01: '0x01 Suppress all IDs from White List',
		0x02: '0x02 Delete an ID from White List',
		0x03: '0x03 Add an ID into White List',
		0x05: '0x05 Freeze the list of devices repeated in auto-record mode into the White List',
		0x04: '0x04 Modify Repeater configuration'
	};
	var RepeaterHelper = /** @class */ (function () {
		function RepeaterHelper() {
		}
		RepeaterHelper.hex2bin = function (hex) {
			return (parseInt(hex, 16).toString(2)).padStart(8, '0');
		};
		RepeaterHelper.getUPStatusFromPayload = function (payload, appContent) {
			var byte = payload[1];
			var charLb = 1;
			if (/^\d$/.test('' + byte)) {
				// one digit
				appContent['frame_counter'] = 0;
				charLb = 0;
			}
			else {
				appContent['frame_counter'] = parseInt(payload.readUInt8(1).toString(16).charAt(0), 16);
			}
			var hexLb = payload.readUInt8(1).toString(16);
			var binLb = RepeaterHelper.hex2bin(hexLb);
			var bitLb = binLb[binLb.length - 1];
			appContent['low_battery'] = (bitLb === '1') ? true : false;
			return appContent;
		};
		RepeaterHelper.getDownlinkDescriptionForCode = function (code) {
			return dlCode[code] || code;
		};
		RepeaterHelper.getErrorDescriptionForCode = function (code) {
			return errorCode[code] || code;
		};
		return RepeaterHelper;
	}());
	codec.RepeaterHelper = RepeaterHelper;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Smart Building 0x1f (TOR configuration) frame parser
     */
	var Sb0x1fParser = /** @class */ (function () {
		function Sb0x1fParser() {
			this.deviceType = 'any';
			this.frameCode = 0x1f;
		}
		Sb0x1fParser.prototype.parseFrame = function (payload, configuration, network) {
			// register 380: Configuration TOR1 (button)
			// register 381: Alarm threshold TOR1
			// register 382: Configuration TOR2 (button)
			// register 383: Alarm threshold TOR2
			var appContent = {
				type: '0x1f Smart Building channels configuration',
				'channel1_configuration_type': this.getTypeText(payload[2] & 0x0f),
				'channel1_configuration_debounce_duration': this.getDebounceDurationText((payload[2] & 0xf0) >> 4),
				'channel1_alarm_threshold': payload.readUInt16BE(3),
				'channel2_configuration_type': this.getTypeText(payload[5] & 0x0f),
				'channel2_configuration_debounce_duration': this.getDebounceDurationText((payload[5] & 0xf0) >> 4),
				'channel2_alarm_threshold': payload.readUInt16BE(6)
			};
			return appContent;
		};
        /**
         * Get debounce duration text
         * @param value value
         */
		Sb0x1fParser.prototype.getDebounceDurationText = function (value) {
			switch (value) {
				case 0x0:
					return 'no_debounce';
				case 0x1:
					return '10msec';
				case 0x2:
					return '20msec';
				case 0x3:
					return '50msec';
				case 0x4:
					return '100msec';
				case 0x5:
					return '200msec';
				case 0x6:
					return '500msec';
				case 0x7:
					return '1s';
				case 0x8:
					return '2s';
				case 0x9:
					return '5s';
				case 0xa:
					return '10s';
				case 0xb:
					return '20s';
				case 0xc:
					return '40s';
				case 0xd:
					return '60s';
				case 0xe:
					return '5min';
				case 0xf:
					return '10min';
				default:
					return '';
			}
		};
        /**
         * Get type text
         * @param value value
         */
		Sb0x1fParser.prototype.getTypeText = function (value) {
			switch (value) {
				case 0x0:
					return 'deactivated';
				case 0x1:
					return 'event_on';
				case 0x2:
					return 'event_off';
				case 0x3:
					return 'event_on_off';
				default:
					return '';
			}
		};
		return Sb0x1fParser;
	}());
	codec.Sb0x1fParser = Sb0x1fParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Smart Building 0x51 (TOR1 alarm) frame parser
     */
	var Sb0x51Parser = /** @class */ (function () {
		function Sb0x51Parser() {
			this.deviceType = 'any';
			this.frameCode = 0x51;
		}
		Sb0x51Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({ type: '0x51 Smart Building TOR1 alarm' }, this.getDataFromPayload(payload));
			return appContent;
		};
		Sb0x51Parser.prototype.getDataFromPayload = function (payload) {
			var appContent = {};
			appContent['alarm_status_tor_previous_frame'] = payload.readUInt8(2) >> 1 & 1;
			appContent['alarm_status_tor_current'] = payload.readUInt8(2) >> 0 & 1;
			appContent['global_digital_counter'] = payload.readUInt32BE(3);
			appContent['instantaneous_digital_counter'] = payload.readUInt16BE(7);
			return appContent;
		};
		return Sb0x51Parser;
	}());
	codec.Sb0x51Parser = Sb0x51Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Smart Building 0x52 (TOR2 alarm) frame parser
     */
	var Sb0x52Parser = /** @class */ (function () {
		function Sb0x52Parser() {
			this.deviceType = 'any';
			this.frameCode = 0x52;
			this.sb0x51Parser = new codec.Sb0x51Parser();
		}
		Sb0x52Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = __assign({}, this.sb0x51Parser.parseFrame(payload, configuration, network), { type: '0x52 Smart Building TOR2 alarm' });
			return appContent;
		};
		return Sb0x52Parser;
	}());
	codec.Sb0x52Parser = Sb0x52Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temperature 0x10 (configuration) frame parser
     */
	var Temp0x10Parser = /** @class */ (function () {
		function Temp0x10Parser() {
			this.deviceType = 'temp';
			this.frameCode = 0x10;
		}
		Temp0x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x10 Temperature configuration' };
			if (payload[8] === 2) {
				// TEST mode => period = value * 20sec
				appContent['transmission_period_keep_alive_sec'] = payload[2] * 20;
				appContent['transmission_period_data_sec'] = payload[3] * 20;
			}
			else {
				// PRODUCTION mode => period = value * 10min
				appContent['transmission_period_keep_alive_min'] = payload[2] * 10;
				appContent['transmission_period_data_min'] = payload[3] * 10;
			}
			// Internal sensor general configuration
			appContent['ambient_probe_id'] = payload[4];
			appContent['ambient_probe_threshold_triggering'] = this.getThresholdTriggeringText(payload[5] & 0x03);
			// External sensor general configuration
			appContent['remote_probe_id'] = payload[6];
			appContent['remote_probe_threshold_triggering'] = this.getThresholdTriggeringText(payload[7] & 0x03);
			// Product mode
			appContent['product_mode'] = codec.PlateformCommonUtils.getProductModeText(payload[8]);
			// ?
			appContent['sensors_activation'] = payload[9];
			if (payload[8] === 2) {
				// TEST mode => period = value * 20sec
				appContent['acquisition_period_sec'] = payload[10] * 20;
			}
			else {
				// PRODUCTION mode => period = value * 10min
				appContent['acquisition_period_min'] = payload[10] * 10;
			}
			return appContent;
		};
        /**
         * Get Threshold Triggering text
         * @param value value
         */
		Temp0x10Parser.prototype.getThresholdTriggeringText = function (value) {
			switch (value) {
				case 0:
					return 'none';
				case 1:
					return 'low_only';
				case 2:
					return 'high_only';
				case 3:
					return 'low_and_high';
				default:
					return '';
			}
		};
		return Temp0x10Parser;
	}());
	codec.Temp0x10Parser = Temp0x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temperature 0x11 (configuration) frame parser
     */
	var Temp0x11Parser = /** @class */ (function () {
		function Temp0x11Parser() {
			this.deviceType = 'temp';
			this.frameCode = 0x11;
		}
		Temp0x11Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x11 Temperature configuration' };
			// Internal sensor high threshold configuration
			appContent['ambient_probe_high_threshold_value'] = payload.readUInt16BE(2) / 10;
			appContent['ambient_probe_high_threshold_hysteresis'] = payload[4] / 10;
			// Internal sensor low threshold configuration
			appContent['ambient_probe_low_threshold_value'] = payload.readUInt16BE(5) / 10;
			appContent['ambient_probe_low_threshold_hysteresis'] = payload[7] / 10;
			// ?
			appContent['super_sampling_factor'] = payload[8];
			return appContent;
		};
		return Temp0x11Parser;
	}());
	codec.Temp0x11Parser = Temp0x11Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temperature 0x12 (configuration) frame parser
     */
	var Temp0x12Parser = /** @class */ (function () {
		function Temp0x12Parser() {
			this.deviceType = 'temp';
			this.frameCode = 0x12;
		}
		Temp0x12Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x12 Temperature configuration' };
			// External sensor high threshold configuration
			appContent['remote_probe_high_threshold_value'] = payload.readUInt16BE(2) / 10;
			appContent['remote_probe_high_threshold_hysteresis'] = payload[4] / 10;
			// External sensor low threshold configuration
			appContent['remote_probe_low_threshold_value'] = payload.readUInt16BE(5) / 10;
			appContent['remote_probe_low_threshold_hysteresis'] = payload[7] / 10;
			return appContent;
		};
		return Temp0x12Parser;
	}());
	codec.Temp0x12Parser = Temp0x12Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temperature 0x30 (keep alive) frame parser
     */
	var Temp0x30Parser = /** @class */ (function () {
		function Temp0x30Parser() {
			this.deviceType = 'temp';
			this.frameCode = 0x30;
			this.temp0x43Parser = new codec.Temp0x43Parser();
		}
		Temp0x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = this.temp0x43Parser.parseFrame(payload, configuration, network);
			appContent['type'] = '0x30 Temperature keep alive';
			return appContent;
		};
		return Temp0x30Parser;
	}());
	codec.Temp0x30Parser = Temp0x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temperature 0x43 (data) frame parser
     */
	var Temp0x43Parser = /** @class */ (function () {
		function Temp0x43Parser() {
			this.deviceType = 'temp';
			this.frameCode = 0x43;
		}
		Temp0x43Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x43 Temperature data' };
			// Internal sensor input states
			appContent['ambient_probe_id'] = (payload[2] & 0xf0) >> 4;
			var rawInternalValue = payload.readInt16BE(3);
			if (rawInternalValue === -32768 /*0x8000*/) {
				appContent['ambient_probe_defect'] = true;
			}
			else {
				// value in °C = frame value / 10
				appContent['ambient_temperature_celsius_degrees'] = rawInternalValue / 10;
			}
			// External sensor input states
			appContent['remote_probe_id'] = (payload[5] & 0xf0) >> 4;
			var rawExternalValue = payload.readInt16BE(6);
			if (rawExternalValue === -32768 /*0x8000*/) {
				appContent['remote_probe_defect'] = true;
			}
			else {
				// value in °C = frame value / 10
				appContent['remote_temperature_celsius_degrees'] = rawExternalValue / 10;
			}
			return appContent;
		};
		return Temp0x43Parser;
	}());
	codec.Temp0x43Parser = Temp0x43Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temperature status byte parser
     */
	var TempStatusByteParser = /** @class */ (function () {
		function TempStatusByteParser() {
			this.deviceType = 'temp';
			this.frameCode = -1;
		}
		TempStatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
			var statusContent = {};
			// Status byte, applicative flags
			statusContent['ambient_probe_alarm'] = ((payload[1] & 0x08) !== 0) ? true : false;
			statusContent['remote_probe_alarm'] = ((payload[1] & 0x10) !== 0) ? true : false;
			return statusContent;
		};
		return TempStatusByteParser;
	}());
	codec.TempStatusByteParser = TempStatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temp 3 0x10 (configuration) frame parser
     */
	var TempV30x10Parser = /** @class */ (function () {
		function TempV30x10Parser() {
			this.deviceType = 'temp3';
			this.frameCode = 0x10;
		}
		TempV30x10Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x10 Temp 3 configuration' };
			appContent['transmissionPeriodKeepAlive'] = { 'unit': 's', 'value': payload.readUInt16BE(2) },
				appContent['numberOfHistorizationBeforeSending'] = payload.readUInt16BE(4),
				appContent['numberOfSamplingBeforeHistorization'] = payload.readUInt16BE(6),
				appContent['samplingPeriod'] = { 'unit': 's', 'value': payload.readUInt16BE(8) * 2 },
				appContent['redundantSamples'] = payload.readUInt8(10),
				appContent['calculatedPeriodRecording'] = {
					'unit': 's',
					'value': payload.readUInt16BE(8) * payload.readUInt16BE(6) * 2
				},
				appContent['calculatedSendingPeriod'] = {
					'unit': 's',
					'value': payload.readUInt16BE(8) * payload.readUInt16BE(6) * payload.readUInt16BE(4) * 2
				};
			return appContent;
		};
		return TempV30x10Parser;
	}());
	codec.TempV30x10Parser = TempV30x10Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temp 3 0x30 (keep alive) frame parser
     */
	var TempV30x30Parser = /** @class */ (function () {
		function TempV30x30Parser() {
			this.deviceType = 'temp3';
			this.frameCode = 0x30;
		}
		TempV30x30Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x30 Temp 3 keep alive' };
			var nbSensors = (payload[1] & 0x10) ? 2 : 1;
			appContent['temperature'] = { 'unit': '°C', 'value': payload.readInt16BE(2) / 10 };
			if (nbSensors === 2) {
				appContent['temperature2'] = { 'unit': '°C', 'value': payload.readInt16BE(4) / 10 };
			}
			return appContent;
		};
		return TempV30x30Parser;
	}());
	codec.TempV30x30Parser = TempV30x30Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temp 3 0x57 (data) frame parser
     */
	var TempV30x57Parser = /** @class */ (function () {
		function TempV30x57Parser() {
			this.deviceType = 'temp3';
			this.frameCode = 0x57;
		}
		TempV30x57Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x57 Temp 3 periodic data' };
			var nbSensors = (payload[1] & 0x10) ? 2 : 1;
			var rawValue;
			var ch1Temp = [], ch2Temp = [];
			// Loop through historic data [t=0, t-1, t-2,...]
			for (var offset = 2; offset < payload.byteLength; offset += 2 * nbSensors) {
				rawValue = payload.readInt16BE(offset);
				ch1Temp.push(rawValue / 10);
				if (nbSensors === 2) {
					rawValue = payload.readInt16BE(offset + 2);
					ch2Temp.push(rawValue / 10);
				}
			}
			appContent['temperatures'] = { 'unit': '°C', 'values': ch1Temp };
			if (nbSensors === 2) {
				appContent['temperatures2'] = { 'unit': '°C', 'values': ch2Temp };
			}
			return appContent;
		};
		return TempV30x57Parser;
	}());
	codec.TempV30x57Parser = TempV30x57Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temp 3 0x58 (alarm) frame parser
     */
	var TempV30x58Parser = /** @class */ (function () {
		function TempV30x58Parser() {
			this.deviceType = 'temp3';
			this.frameCode = 0x58;
		}
		TempV30x58Parser.prototype.parseFrame = function (payload, configuration, network) {
			var appContent = { type: '0x58 Temp 3 alarm' };
			var nbSensors = (payload[1] & 0x10) ? 2 : 1;
			appContent['alarmTemperature'] = {
				'alarmStatus': this.getAlarmStatusText(payload.readUInt8(2)),
				'temperature': { 'unit': '°C', 'value': payload.readInt16BE(3) / 10 }
			};
			if (nbSensors === 2) {
				appContent['alarmTemperature2'] = {
					'alarmStatus': this.getAlarmStatusText(payload.readUInt8(5)),
					'temperature': { 'unit': '°C', 'value': payload.readInt16BE(6) / 10 }
				};
			}
			return appContent;
		};
        /**
         * Get Alarm status text
         * @param value value
         */
		TempV30x58Parser.prototype.getAlarmStatusText = function (value) {
			switch (value) {
				case 1:
					return 'highThreshold';
				case 2:
					return 'lowThreshold';
				default:
					return 'none';
			}
		};
		return TempV30x58Parser;
	}());
	codec.TempV30x58Parser = TempV30x58Parser;
})(codec || (codec = {}));
var codec;
(function (codec) {
    /**
     * Temp 3 status byte parser
     */
	var TempV3StatusByteParser = /** @class */ (function () {
		function TempV3StatusByteParser() {
			this.deviceType = 'temp3';
			this.frameCode = -1;
		}
		TempV3StatusByteParser.prototype.parseFrame = function (payload, configuration, network) {
			var statusContent = {};
			statusContent['frameCounter'] = (payload[1] & 0xe0) >> 5;
			statusContent['hardwareError'] = ((payload[1] & 0x04) !== 0) ? true : false;
			statusContent['lowBattery'] = ((payload[1] & 0x02) !== 0) ? true : false;
			statusContent['configurationDone'] = ((payload[1] & 0x01) !== 0) ? true : false;
			// Status byte, applicative flags
			statusContent['configurationInconsistency'] = ((payload[1] & 0x08) !== 0) ? true : false;
			statusContent['configuration2ChannelsActivated'] = ((payload[1] & 0x10) !== 0) ? true : false;
			return { 'status': statusContent };
		};
		return TempV3StatusByteParser;
	}());
	codec.TempV3StatusByteParser = TempV3StatusByteParser;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var PartialDecodingReason;
	(function (PartialDecodingReason) {
		PartialDecodingReason[PartialDecodingReason["NONE"] = 0] = "NONE";
		PartialDecodingReason[PartialDecodingReason["MISSING_NETWORK"] = 1] = "MISSING_NETWORK";
		PartialDecodingReason[PartialDecodingReason["MISSING_CONFIGURATION"] = 2] = "MISSING_CONFIGURATION";
	})(PartialDecodingReason = codec.PartialDecodingReason || (codec.PartialDecodingReason = {}));
})(codec || (codec = {}));
var codec;
(function (codec) {
	var ContentImpl = /** @class */ (function () {
		function ContentImpl(type) {
			if (type === void 0) { type = 'Unknown'; }
			this.type = type;
			this.partialDecoding = codec.PartialDecodingReason.NONE;
		}
		ContentImpl.merge = function () {
			var contents = [];
			for (var _i = 0; _i < arguments.length; _i++) {
				contents[_i] = arguments[_i];
			}
			if (!contents || contents.length === 0) {
				return null;
			}
			return Object.assign.apply(Object, [new ContentImpl(contents[0].type)].concat(contents));
		};
		ContentImpl.prototype.merge = function () {
			var contents = [];
			for (var _i = 0; _i < arguments.length; _i++) {
				contents[_i] = arguments[_i];
			}
			return ContentImpl.merge.apply(ContentImpl, [this].concat(contents));
		};
		return ContentImpl;
	}());
	codec.ContentImpl = ContentImpl;
})(codec || (codec = {}));
var codec;
(function (codec) {
	var PlateformCommonUtils = /** @class */ (function () {
		function PlateformCommonUtils() {
		}
        /**
         * Get Product Mode text
         * @param value value
         */
		PlateformCommonUtils.getProductModeText = function (value) {
			switch (value) {
				case 0:
					return 'PARK';
				case 1:
					return 'PRODUCTION';
				case 2:
					return 'TEST';
				case 3:
					return 'DEAD';
				default:
					return '';
			}
		};
		return PlateformCommonUtils;
	}());
	codec.PlateformCommonUtils = PlateformCommonUtils;
})(codec || (codec = {}));
//# sourceMappingURL=lib.js.map


//*****************************************************************************
// Javascript codec functions for Adeunis Temp endpoints
// Authors: Didier Donsez, Vivien Quéma
// Licence: EPL 1.0
//*****************************************************************************

if (typeof global.codec === 'undefined') {
	global.codec = codec;
}

var d = new global.codec.Decoder();

var AdeunisRF_All_Payload = {

	'decodeUp': function (port, payload) {
		return d.decode(payload.toString('hex'));
	},

	// encodes the given object into an array of bytes
	'encodeDn': function (port, value) {
		// TO BE IMPLEMENTED
		return null;
	}
}

// module.exports.Decoder = AdeunisRF_All_Payload;
// console.log(AdeunisRF_All_Payload.decodeUp(1, Buffer.from('43400100ac0100ae', 'hex')));

var p = msg.payload;

if(! p.applicationName.startsWith("ADEUNIS")) {
    return undefined;
}

if(! p.data) {
    return undefined;
}

var o = AdeunisRF_All_Payload.decodeUp(p.fPort,p.frmPayload);

msg.payload.object = o;

return msg;
