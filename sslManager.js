'use strict';

var fs = require("fs");

var serial = 0;
var regEx = new RegExp(/^ssl[0-9]+\.json/);
var sslDir;

var fields = [];
var uisettings;

(function readSettings() {
	uisettings = JSON.parse(fs.readFileSync('./uiSettings.json'))
	fields = uisettings.parameters;	
})();

// SSL Object
function createNewSsl(input) {
	var ssl = new Object();
	ssl["parameters"] = {};
	var field;
	var sslParameters = ssl["parameters"];
	var sslParam;
	var fromDate, toDate;
    for(var i=0; i<fields.length; i++) {
		field = fields[i];
		if(typeof input[field.param] === 'undefined' || input[field.param] === null || input[field.param] === "") {
			ssl = null;
			break;
		}
		
		sslParameters[field.param] = {};
		sslParam = sslParameters[field.param];
		sslParam.type = field.type;
		if(field.type === "text") {
			sslParam.value = input[field.param];
		}
		else if(field.type === "date") {
			if(field.comparator === "from") {
				fromDate = new Date(input[field.param]);
				if(toDate && toDate < fromDate) {
					ssl = null;
					break;
				}
				sslParam.value = fromDate;
			}
			else if(field.comparator === "to") {
				toDate = new Date(input[field.param]);
				if(fromDate && toDate < fromDate) {
					ssl = null;
					break;
				}
				sslParam.value = toDate;
			}
		}
	};
	if(ssl) {
		ssl.serialNumber = serial++;
	}	
	return ssl;
}

var ssls = [];

function readFiles() {
  var i = 0;
  var filenames = fs.readdirSync(sslDir)
	filenames.forEach(function(filename) {
		if(regEx.test(filename)) {
		  ssls[i] = JSON.parse(fs.readFileSync(sslDir + filename, 'utf8'));
		  if(ssls[i].serialNumber >= serial) {
			  serial = ssls[i].serialNumber + 1;
		  }
		  i++;
		}	  
	});
};

// Create a SSL
var createSsl = function (data) {
	var newSSL = createNewSsl(data);
	if(newSSL) {
		ssls.push(newSSL);
		fs.writeFileSync(sslDir + 'ssl' + newSSL.serialNumber + '.json', JSON.stringify(newSSL));
		return newSSL;
	}
	return null;	
};

// Get all UISettings
var getUiSettings = function () {
	return uisettings;
};

// Get all SSLs
var getAllSsls = function () {
	return ssls;
};

// Get a SSL by serial number
var getSsl = function (_serialNumber) {
	var ssl = null;
    for (var i = 0; i < ssls.length; i++) {
        if (ssls[i].serialNumber === _serialNumber) {
			ssl = ssls[i];
			break;
        }
    }
    return ssl;
};

// Search matching SSLs
var search = function(params) {
	var filtered = [];
	var match = false;
	var field;
	var sslParameters;
	ssls.forEach(function(ssl) {
		sslParameters = ssl["parameters"];
		for(var i=0; i<fields.length; i++) {
			field = fields[i];
			if(typeof params[field.param] !== 'undefined') {
				if(field.type === "text") {
					match = (sslParameters[field.param].value.toLowerCase().indexOf(params[field.param].toLowerCase()) !== -1);
				}
				else if(field.type === "date") {
					if(field.comparator === "from") {
						match = (sslParameters[field.param].value <= new Date(params[field.param]));
					}
					else if(field.comparator === "to") {
						match = (sslParameters[field.param].value >= new Date(params[field.param]));
					}
				}
				
				if(!match) {
					break;
				}
			}
		}
				
		if(match) {
			filtered.push(ssl);
		}
		match = false;
	});
	return filtered;
}

// Delete a SSL by serial number
var deleteSsl = function (_serialNumber) {
	var found = -1;
    for (var i = 0; i < ssls.length; i++) {
        if (ssls[i].serialNumber === _serialNumber) {
			found = ssls[i].serialNumber;
			fs.unlinkSync(sslDir + 'ssl' + ssls[i].serialNumber + '.json');
            ssls.splice(i, 1);	
			break;
		}
    }
    return found;
};

// Delete a SSL by serial number
var deleteAll = function () {
	for (var i = 0; i < ssls.length; i++) {
		fs.unlinkSync(sslDir + 'ssl' + ssls[i].serialNumber + '.json');   		
	}
    ssls = [];
	serial = 0;
};

// Update a SSL by serial number
var updateSsl = function (_serialNumber, updateSsl) {
	var found = null;
	var field;
	var ssl;
	var sslParameters;
	var fromDate, toDate;
	var validData = true;
	for (var i = 0; i < ssls.length; i++) {
		ssl = ssls[i];
		sslParameters = ssl["parameters"];
		if (ssl.serialNumber === _serialNumber) {
			for(var i=0; i<fields.length; i++) {
				field = fields[i];
				if(typeof updateSsl[field.param] !== 'undefined' && updateSsl[field.param] !== null && updateSsl[field.param] !== "") {
					if(field.type === "text") {
						sslParameters[field.param].value = updateSsl[field.param];
					}
					else if(field.type === "date") {
						if(field.comparator === "from") {
							fromDate = new Date(updateSsl[field.param]);
							if(toDate && toDate < fromDate) {
								validData = false;
								break;
							}
							sslParameters[field.param].value = fromDate;
						}
						else if(field.comparator === "to") {
							toDate = new Date(updateSsl[field.param]);
							if(fromDate && toDate < fromDate) {
								validData = false;
								break;
							}
							sslParameters[field.param].value = toDate;
						}
					}
				}
			};
			if(validData) {
				fs.unlinkSync(sslDir + 'ssl' + ssl.serialNumber + '.json');
				fs.writeFileSync(sslDir + 'ssl' + ssl.serialNumber + '.json', JSON.stringify(ssl));
				found = ssl;
				break;
			}		
		}
    }
    return found;
};

var setSslDir = function(dir) {
	sslDir = dir;
	if (!fs.existsSync(sslDir)){
		fs.mkdirSync(sslDir);
	} 
	readFiles();
}

module.exports = {  
  createSsl: createSsl,
  updateSsl: updateSsl,
  deleteSsl: deleteSsl,
  deleteAll: deleteAll,
  getSsl: getSsl,
  search: search,  
  getAllSsls: getAllSsls,
  getUiSettings: getUiSettings,
  setSslDir: setSslDir
}