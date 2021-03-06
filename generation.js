(function(){
	var debug = true;
	var game = {};
	
	var config = {
		uiTickSpeed : 250,
		tickSpeed : {stopped:-1, normal: 1000},
		resourceTypes : {
			electric:{name:"Electricity", unit:"kw"},
			oil:{name:"Oil", unit:"L"}
		},
		entities:{
			"ElectricalSubstation":{
				name:"Electrical Substation",
				type:"sink",
				inputs:{electric: 1000},
				outputs:{},
				cost:0.14,
				buildable:false,
				id:-1
			},
			"OilGenset20kw":{
				name:"Oil Genset 20kw",
				type:"electricGeneration",
				inputs:{oil:6},
				outputs:{electric:20},
				cost:5000,
				buildable:true,
				id:-1
			},
			"OilTruck":{
				name:"Oil Truck",
				type:"source",
				inputs:{},
				outputs:{oil:10},
				cost:1.27,
				buildable:false,
				id:-1
			},
			"OilTank100":{
				name:"Oil Tank 100L",
				type:"storage",
				storage:{oil:100},
				cost:500
			}
		}
	};
	game.config = config;
	
	var data = {
		tickSpeed : -1,
		tick : 0,
		nextId : 0,
		money : 0,
		regions : []
	};
	game.data = data;

	var newRegion = {
		id: -1,
		name:"name",
		equipment:[],
		equipmentById:{}, //someEquipId:someEquipObject
		inputsByType:{
			electric:[], //someEquipId,someEquipId2
			oil:[]
		},
		outputsByType:{
			electric:[],
			oil:[]
		},
		storageByType:{
			electric:[],
			oil:[]
		}
	};
	
	if (debug){
		window.game = game;
	}
	
	var initialize = function(){
		data.money = 5600;
		
		initializeUI();
		
		var r = createRegion();
		
		r.name = "Tiny Island";
		
		createEntity(r,"OilTruck");

		var e = createEntity(r,"ElectricalSubstation");
		e.cost = 0.45;
	};
	game.initialize = initialize;
	$().ready(initialize);
	
	//{**********Game Engine****************
	var gameloop = function(){
		var tickTime = Date.now();
		data.tick++;
		
		for (var i = 0; i<data.regions.length; i++){
			processRegion(data.regions[i]);
		}
		
		//Schedule next tick
		if (data.tickSpeed > config.tickSpeed.stopped)
		{
			setTimeout(gameloop, data.tickSpeed);
		}
		if (debug){console.log("tick end: " + data.tick + " " + (Date.now()-tickTime) + "ms");}
	};
	game.gameloop = gameloop;
	
	var processRegion = function(region){
		//Process all equipment
		for (var i=0; i<region.equipment.length; i++){
			var equip = region.equipment[i];
			processEquipment(equip);
		}
		
		//Process input buffers
		for (var resKey in region.inputsByType){
			var inputs = region.inputsByType[resKey];
			for (var i=0; i<inputs.length; i++){
				var noMoreOfTypeLeft = processInputBuffer(resKey, inputs[i], region);
				if (noMoreOfTypeLeft) break;
			}
		}
		
		//Process storage
		for (var resKey in region.storageByType){
			var storages = region.storageByType[resKey];
			for (var i = 0; i<storages.length; i++){
				processStorage(resKey, storages[i], region);
			}
		}
	};
	
	var processInputBuffer = function(resKey, equipId, region){
		var equip = region.equipmentById[equipId];
		var roomInBuffer = equip.inputs[resKey] - equip.inputs[resKey + "buffer"];
		
		if (roomInBuffer == 0) return;
		
		//Look in output buffers
		var outputBuffers = region.outputsByType[resKey]
		for (var i = 0; i < outputBuffers.length; i++){
			var srcEquip = region.equipmentById[outputBuffers[i]];
			
			var qtyInSrc = srcEquip.outputs[resKey+"buffer"];
			if (qtyInSrc == 0) continue;
			var max = qtyInSrc > roomInBuffer ? roomInBuffer : qtyInSrc;
			
			roomInBuffer -= max;
			srcEquip.outputs[resKey+"buffer"] -= max;
			equip.inputs[resKey+"buffer"] += max;
			
			if (roomInBuffer == 0) return false;
		}
		
		//Look in storage
		var storage = region.storageByType[resKey]
		for (var i = 0; i < storage.length; i++){
			var srcEquip = region.equipmentById[storage[i]];
			
			var qtyInSrc = srcEquip.storage[resKey+"buffer"];
			if (qtyInSrc == 0) continue;
			var max = qtyInSrc > roomInBuffer ? roomInBuffer : qtyInSrc;
			
			roomInBuffer -= max;
			srcEquip.storage[resKey+"buffer"] -= max;
			equip.inputs[resKey+"buffer"] += max;
			
			if (roomInBuffer == 0) return false;
		}
		
		return true;
	};
	
	var processStorage = function(resKey, equipId, region){
		var equip = region.equipmentById[equipId];
		var roomInBuffer = equip.storage[resKey] - equip.storage[resKey + "buffer"];
		
		if (roomInBuffer == 0) return;
		
		//Look in output buffers
		var outputBuffers = region.outputsByType[resKey]
		for (var i = 0; i < outputBuffers.length; i++){
			var srcEquip = region.equipmentById[outputBuffers[i]];
			
			var qtyInSrc = srcEquip.outputs[resKey+"buffer"];
			if (qtyInSrc == 0) break;
			var max = qtyInSrc > roomInBuffer ? roomInBuffer : qtyInSrc;
			
			roomInBuffer -= max;
			srcEquip.outputs[resKey+"buffer"] -= max;
			equip.storage[resKey+"buffer"] += max;
			
			if (roomInBuffer == 0) break;
		}
	};
	
	var processEquipment = function(equip){
		if (!equip.enabled) return;
		//Handles sources
		if (equip.type == "source"){
			processEquipmentSource(equip);
			return;
		}
		//Handle sinks
		else if (equip.type == "sink"){
			processEquipmentSink(equip);
			return;
		}
		//Ignore storage
		else if (equip.type == "storage"){
			return;
		}
		//Handle converters
		else{
			processEquipmentConverter(equip);
			return;
		}
	};
	
	var processEquipmentSource = function(equip){
		for (var resourceKey in equip.outputs){
			if (resourceKey.substr(resourceKey.length-6) === "buffer") continue;
			var qty = equip.outputs[resourceKey] - equip.outputs[resourceKey+"buffer"];
			if (qty == 0){continue;}
			
			var cost = qty * equip.cost;
			if (cost > data.money){
				cost = data.money;
				qty = data.money / equip.cost;
			}
			data.money -= cost;
			equip.outputs[resourceKey+"buffer"] += qty;
		}
	};
	
	var processEquipmentSink = function(equip){
		for (var resourceKey in equip.inputs){
			if (resourceKey.substr(resourceKey.length-6) === "buffer") continue;
			var qty = equip.inputs[resourceKey+"buffer"];
			if (qty == 0){continue;}
			
			var value = qty * equip.cost;
			
			data.money += value;
			equip.inputs[resourceKey+"buffer"] -= qty;
		}
	};
	
	var processEquipmentConverter = function (equip){
		//Check if outputs are all empty
		for (var resourceKey in equip.outputs){
			if (resourceKey.substr(resourceKey.length-6) === "buffer") continue;
			if (equip.outputs[resourceKey+"buffer"] !== 0){
				return;
			}
		}
		
		//Check if inputs are all full
		for (var resourceKey in equip.inputs){
			if (resourceKey.substr(resourceKey.length-6) === "buffer") continue;
			if(equip.inputs[resourceKey] !== equip.inputs[resourceKey+"buffer"]){
				return;
			}
		}
		
		//Fill outputs
		for (var resourceKey in equip.outputs){
			if (resourceKey.substr(resourceKey.length-6) === "buffer") continue;
			equip.outputs[resourceKey+"buffer"] = equip.outputs[resourceKey];
		}
		//Empty inputs
		for (var resourceKey in equip.inputs){
			if (resourceKey.substr(resourceKey.length-6) === "buffer") continue;
			equip.inputs[resourceKey+"buffer"] = 0;
		}
	};
	
	var toggleGamestate = function(){
		if (data.tickSpeed > config.tickSpeed.stopped)
		{
			data.tickSpeed = config.tickSpeed.stopped;
			$("#gamestate").text("stopped");
		}
		else
		{
			data.tickSpeed = config.tickSpeed.normal;
			gameloop();
			$("#gamestate").text("running");
		}
	};
	
	var createRegion = function(){
		var region = (JSON.parse(JSON.stringify(newRegion)));
		region.id = data.nextId++;
		data.regions.push(region);
		return region;
	};
	game.createRegion = createRegion;
	
	var createEntity = function(region, entityName){		
		var entity = JSON.parse(JSON.stringify(config.entities[entityName]));
		if (data.money < entity.cost){
			console.log('not enough money!');
			return;
		}
		if (entity.type == "source" || entity.type == "sink"){
			
		}
		else{
			data.money -= entity.cost;
		}
		entity.id = data.nextId++;
		entity.enabled = true;
		entity.nameId = entityName;
		
		region.equipment.push(entity);
		region.equipmentById[entity.id] = entity;
		for (var key in entity.inputs){
			region.inputsByType[key].push(entity.id);
			entity.inputs[key+"buffer"] = 0;
		}
		for (var key in entity.outputs){
			region.outputsByType[key].push(entity.id);
			entity.outputs[key+"buffer"] = 0;
		}
		for (var key in entity.storage){
			region.storageByType[key].push(entity.id);
			entity.storage[key+"buffer"] = 0;
		}
		UiUpdateEntity(entity);
		return entity;
	};
	//}**********End Game Engine****************
	
	//{**********UI bits********************
	var uiLoop = function(){
		$("#money").text(data.money.toFixed(2));
		
		var hour = game.data.tick % 24;
		var day = ((game.data.tick - hour) / 24) % 365;
		var year = ((game.data.tick - hour - (day*24)) / 365);
		
		$("#gameTime").text("Hour:" + hour + " Day:" + day + " Year:" + year);
		
		updateEntityList();
		
		//Schedule next tick
		setTimeout(uiLoop, config.uiTickSpeed);
	}
	
	var initializeUI = function(){
		$("#toggleGamestate").on("click",toggleGamestate);
		
		UiCreateEntityList();
		
		uiLoop();
	};
	
	/*Create the list of entities, add to UI*/
	var UiCreateEntityList = function(){
		//loop config entities to build menu
		for (var key in config.entities){
			var entity = config.entities[key];
			var item = "<div class='entityList "+key+"'>";
			item += entity.name;
			if (entity.type == "source" || entity.type == "sink"){
				
			}
			else{
				item += " cost: $" + entity.cost;
				item += " qty: <span class='qty'>0</span>";
				item += " <button id='purchaseId"+key+"'>purchase</button>";
			}
			item += "<div class='individual'></div>";
			item +="</div>";
			$("#"+entity.type).append(item);
			
			if (entity.type == "source" || entity.type == "sink"){
				
			}
			else{
				$("#purchaseId"+key).on('click', 
					function(entityKey){
						return function(){
							createEntity(data.regions[0],entityKey);
						};
					}(key)
				);
			}
			
		}
	};
	
	/*Add a single entity in the UI	*/
	var UiUpdateEntity = function(entity){
		var qtyNode = $(".entityList."+entity.nameId+" .qty");
		var qty = parseInt(qtyNode.text()) + 1;
		qtyNode.text(qty);
		
		var eNode = $("#e"+entity.id);
		var html = "<div id='e"+entity.id+"'>";
		html += "id: " + entity.id + " ";
		html += "<button id='disableId"+entity.id+"'>on/off</button>";
		html += "<div class='data'></div></div>";
		$(".entityList."+entity.nameId+" .individual").append(html);
		
		$("#disableId"+entity.id).on('click',function(){
			entity.enabled = !entity.enabled;
		});
	};
	
	/*Update all the entities inputs/outputs/storage*/
	var updateEntityList = function(){
		if (data.regions[0] === undefined) return;
		for (var key in data.regions[0].equipment){
			var entity = data.regions[0].equipment[key];
			var eNode = $("#e"+entity.id+" div.data");
			
			var html = "";
			html += "Inputs:";
			for (var rkey in entity.inputs){
				if (rkey.substr(rkey.length-6) === "buffer") continue;
				var item = entity.inputs[rkey];
				var itemBuffer = entity.inputs[rkey+"buffer"];
				var rtype = config.resourceTypes[rkey];
				html += rtype.name + ": "+item+"/"+itemBuffer+" "+rtype.unit;
			}
			html += "<br/>Outputs:";
			for (var rkey in entity.outputs){
				if (rkey.substr(rkey.length-6) === "buffer") continue;
				var item = entity.outputs[rkey];
				var itemBuffer = entity.outputs[rkey+"buffer"];
				var rtype = config.resourceTypes[rkey];
				html += rtype.name + ": "+item+"/"+itemBuffer+" "+rtype.unit;
			}
			
			html += "<br/>Storage:";
			for (var rkey in entity.storage){
				if (rkey.substr(rkey.length-6) === "buffer") continue;
				var item = entity.storage[rkey];
				var itemBuffer = entity.storage[rkey+"buffer"];
				var rtype = config.resourceTypes[rkey];
				html += rtype.name + ": "+item+"/"+itemBuffer+" "+rtype.unit;
			}
			
			eNode.html(html);
			
		}
	};
	
	//}
	
	return {
		
	}
})();