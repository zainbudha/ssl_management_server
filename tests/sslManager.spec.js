var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var ssl = require('../sslManager.js');
var fs = require('fs');


describe('SSL Manager test', function() {
  before(function() {
	if (!fs.existsSync('./tests/testSsls')){
		fs.mkdirSync('./tests/testSsls');
	}  
  });
  
  beforeEach(function() {
	ssl.deleteAll();
  });
  
  after(function() {
	ssl.deleteAll();
  });

  it('should get ui settings', function() {
    expect(ssl.getUiSettings()).to.have.all.keys('parameters');
  });
  
  it('should create a new SSL', function() {
	ssl.setSslDir('./tests/testSsls/');
	var newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	var createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	expect(createdSsl.parameters).to.have.all.keys('issuedTo', 'issuedBy', 'validFrom', 'validTo');
	expect(createdSsl.parameters.issuedTo.value).to.equal('Cisco');
	expect(createdSsl.parameters.issuedTo.type).to.equal('text');
	expect(createdSsl.parameters.issuedBy.value).to.equal('Google');
	expect(createdSsl.parameters.issuedBy.type).to.equal('text');
	expect(createdSsl.parameters.validFrom.value.toString()).to.equal(new Date('12/1/2016').toString());
	expect(createdSsl.parameters.validFrom.type).to.equal('date');
	expect(createdSsl.parameters.validTo.value.toString()).to.equal(new Date('12/1/2017').toString());
	expect(createdSsl.parameters.validTo.type).to.equal('date');
  });
  
  it('should not create a new SSL if parameters are missing', function() {
	ssl.setSslDir('./tests/testSsls/');
	var newSsl = {
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	expect(ssl.createSsl(newSsl)).to.be.null;
	newSsl = {
		"issuedTo":"Cisco",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	expect(ssl.createSsl(newSsl)).to.be.null;
	newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validTo":"12/1/2017"
		}
	expect(ssl.createSsl(newSsl)).to.be.null;
	newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016"
		}
	expect(ssl.createSsl(newSsl)).to.be.null;
	newSsl = {}
	expect(ssl.createSsl(newSsl)).to.be.null;
  });
  
  it('should not create a new SSL if from date is greater than to date', function() {
	ssl.setSslDir('./tests/testSsls/');
	var newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2017",
		"validTo":"12/1/2016"
		}
	expect(ssl.createSsl(newSsl)).to.be.null;
  });
  
  it('should update an SSL', function() {
	ssl.setSslDir('./tests/testSsls/');
	var newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	var createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	
	var updateSsl = {
		"issuedTo":"Infosys",
		"issuedBy":"TCS",
		"validFrom":"11/5/2015",
		"validTo":"4/6/2017"
	}
	var updatedSsl = ssl.updateSsl(createdSsl.serialNumber, updateSsl);
	expect(updatedSsl).to.not.be.null;
	expect(updatedSsl).to.have.all.keys('parameters', 'serialNumber');
	expect(updatedSsl.serialNumber).to.equal(createdSsl.serialNumber);
	expect(updatedSsl.parameters).to.have.all.keys('issuedTo', 'issuedBy', 'validFrom', 'validTo');
	expect(updatedSsl.parameters.issuedTo.value).to.equal('Infosys');
	expect(updatedSsl.parameters.issuedTo.type).to.equal('text');
	expect(updatedSsl.parameters.issuedBy.value).to.equal('TCS');
	expect(updatedSsl.parameters.issuedBy.type).to.equal('text');
	expect(updatedSsl.parameters.validFrom.value.toString()).to.equal(new Date('11/5/2015').toString());
	expect(updatedSsl.parameters.validFrom.type).to.equal('date');
	expect(updatedSsl.parameters.validTo.value.toString()).to.equal(new Date('4/6/2017').toString());
	expect(updatedSsl.parameters.validTo.type).to.equal('date');
  });
  
  it('should not update an SSL if not found', function() {
	ssl.setSslDir('./tests/testSsls/');
	var updateSsl = {
		"issuedTo":"Infosys",
		"issuedBy":"TCS",
		"validFrom":"11/5/2015",
		"validTo":"4/6/2017"
	}
	var updatedSsl = ssl.updateSsl(-1, updateSsl);
	expect(updatedSsl).to.be.null;
  });
  
  it('should not update an SSL if from date is greater than to date', function() {
	ssl.setSslDir('./tests/testSsls/');
	var newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	var createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	
	var updateSsl = {
		"issuedTo":"Infosys",
		"issuedBy":"TCS",
		"validFrom":"11/5/2017",
		"validTo":"4/6/2015"
	}
	var updatedSsl = ssl.updateSsl(createdSsl.serialNumber, updateSsl);
	expect(updatedSsl).to.be.null;
  });
  
  it('should delete an SSL', function() {
	ssl.setSslDir('./tests/testSsls/');
	var newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	var createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	
	expect(ssl.deleteSsl(createdSsl.serialNumber)).to.equal(createdSsl.serialNumber);
  });
  
  it('should not delete an SSL if not found', function() {
	ssl.setSslDir('./tests/testSsls/');
	expect(ssl.deleteSsl(-10)).to.equal(-1);
  });
  
  it('should get an SSL', function() {
	ssl.setSslDir('./tests/testSsls/');
	var newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	var createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	
	var retrievedSsl = ssl.getSsl(createdSsl.serialNumber);
	expect(retrievedSsl).to.not.be.null;
	expect(retrievedSsl).to.have.all.keys('parameters', 'serialNumber');
	expect(retrievedSsl.serialNumber).to.equal(createdSsl.serialNumber);
	expect(retrievedSsl.parameters).to.have.all.keys('issuedTo', 'issuedBy', 'validFrom', 'validTo');
	expect(retrievedSsl.parameters.issuedTo.value).to.equal('Cisco');
	expect(retrievedSsl.parameters.issuedTo.type).to.equal('text');
	expect(retrievedSsl.parameters.issuedBy.value).to.equal('Google');
	expect(retrievedSsl.parameters.issuedBy.type).to.equal('text');
	expect(retrievedSsl.parameters.validFrom.value.toString()).to.equal(new Date('12/1/2016').toString());
	expect(retrievedSsl.parameters.validFrom.type).to.equal('date');
	expect(retrievedSsl.parameters.validTo.value.toString()).to.equal(new Date('12/1/2017').toString());
	expect(retrievedSsl.parameters.validTo.type).to.equal('date');
  });
  
  it('should not get an SSL if not present', function() {
	ssl.setSslDir('./tests/testSsls/');
	
	var retrievedSsl = ssl.getSsl(-1);
	expect(retrievedSsl).to.be.null;
  });
  
  it('should getAllSsls', function() {
	ssl.setSslDir('./tests/testSsls/');
	
	var newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	var createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	expect(createdSsl.serialNumber).to.equal(0);
	
	newSsl = {
		"issuedTo":"Infosys",
		"issuedBy":"TCS",
		"validFrom":"5/18/1988",
		"validTo":"6/2/2000"
		}
	createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	expect(createdSsl.serialNumber).to.equal(1);
	
	var allSsls = ssl.getAllSsls();
	expect(allSsls.length).to.equal(2);
	expect(allSsls[0]).to.not.be.null;
	expect(allSsls[0]).to.have.all.keys('parameters', 'serialNumber');
	expect(allSsls[0].serialNumber).to.equal(0);
	
	expect(allSsls[1]).to.not.be.null;
	expect(allSsls[1]).to.have.all.keys('parameters', 'serialNumber');
	expect(allSsls[1].serialNumber).to.equal(1);
  });
  
  it('should search for SSLs', function() {
	ssl.setSslDir('./tests/testSsls/');
	
	var newSsl = {
		"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"
		}
	var createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	expect(createdSsl.serialNumber).to.equal(0);
	
	newSsl = {
		"issuedTo":"Infosys",
		"issuedBy":"TCS",
		"validFrom":"5/18/1988",
		"validTo":"6/2/2000"
		}
	createdSsl = ssl.createSsl(newSsl);
	expect(createdSsl).to.not.be.null;
	expect(createdSsl).to.have.all.keys('parameters', 'serialNumber');
	expect(createdSsl.serialNumber).to.equal(1);
	
	var searchedSsls = ssl.search(
		{"issuedTo":"Infosys",
		"issuedBy":"TCS",
		"validFrom":"5/18/1988",
		"validTo":"6/2/2000"}
	);
	expect(searchedSsls.length).to.equal(1);
	expect(searchedSsls[0]).to.not.be.null;
	expect(searchedSsls[0]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[0].serialNumber).to.equal(1);
	
	searchedSsls = ssl.search(
		{"issuedTo":"Cisco",
		"issuedBy":"Google",
		"validFrom":"12/1/2016",
		"validTo":"12/1/2017"}
	);
	expect(searchedSsls.length).to.equal(1);
	expect(searchedSsls[0]).to.not.be.null;
	expect(searchedSsls[0]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[0].serialNumber).to.equal(0);
	
	searchedSsls = ssl.search(
		{"issuedTo":"i"}
	);
	expect(searchedSsls.length).to.equal(2);
	expect(searchedSsls[0]).to.not.be.null;
	expect(searchedSsls[0]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[0].serialNumber).to.equal(0);
	
	expect(searchedSsls[1]).to.not.be.null;
	expect(searchedSsls[1]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[1].serialNumber).to.equal(1);
	
	searchedSsls = ssl.search(
		{"validFrom":"12/10/2016"}
	);
	expect(searchedSsls.length).to.equal(2);
	expect(searchedSsls[0]).to.not.be.null;
	expect(searchedSsls[0]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[0].serialNumber).to.equal(0);
	
	expect(searchedSsls[1]).to.not.be.null;
	expect(searchedSsls[1]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[1].serialNumber).to.equal(1);
	
	searchedSsls = ssl.search(
		{"validTo":"3/15/2000"}
	);
	expect(searchedSsls.length).to.equal(2);
	expect(searchedSsls[0]).to.not.be.null;
	expect(searchedSsls[0]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[0].serialNumber).to.equal(0);
	
	expect(searchedSsls[1]).to.not.be.null;
	expect(searchedSsls[1]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[1].serialNumber).to.equal(1);
	
	searchedSsls = ssl.search(
		{"validFrom":"5/18/1989"}
	);
	expect(searchedSsls.length).to.equal(1);
	expect(searchedSsls[0]).to.not.be.null;
	expect(searchedSsls[0]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[0].serialNumber).to.equal(1);
	
	searchedSsls = ssl.search(
		{"validTo":"5/18/2016"}
	);
	expect(searchedSsls.length).to.equal(1);
	expect(searchedSsls[0]).to.not.be.null;
	expect(searchedSsls[0]).to.have.all.keys('parameters', 'serialNumber');
	expect(searchedSsls[0].serialNumber).to.equal(0);
  });
  
  it('should delete all SSLs', function() {
	ssl.setSslDir('./tests/testSsls/');
	ssl.deleteAll();
	expect(ssl.getSsl(0)).to.be.null;
	expect(ssl.getAllSsls().length).to.equal(0);
  });
});
