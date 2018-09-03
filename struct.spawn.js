var structSpawn = {

    /** Run spawn **/
    run: function(spawn,thisroom) {
		var thisroomCreeps = thisroom.find(FIND_MY_CREEPS);
		/** Count and Display creeps **/
		var workers = _.filter(thisroomCreeps, (creep) => creep.memory.role == 'worker');
		console.log('Room '+thisroom.name+' has '+workers.length+' workers.');
		var upgraders = _.filter(thisroomCreeps, (creep) => creep.memory.role == 'upgrader');
		console.log('Room '+thisroom.name+' has '+upgraders.length+' upgraders.');
		var repairers = _.filter(thisroomCreeps, (creep) => creep.memory.role == 'repairer');
		console.log('Room '+thisroom.name+' has '+repairers.length+' repairers.');
		var harvesters = _.filter(thisroomCreeps, (creep) => creep.memory.role == 'harvester');
		console.log('Room '+thisroom.name+' has '+harvesters.length+' harvesters.');
		var haulers = _.filter(thisroomCreeps, (creep) => creep.memory.role == 'hauler');
		console.log('Room '+thisroom.name+' has '+haulers.length+' haulers.');
		var guards = _.filter(thisroomCreeps, (creep) => creep.memory.role == 'guard');
		/** Exit if busy **/
		if (spawn.spawning) return;
		/** Cost calculating function **/
		var cost = function(body) {
			var mycost = 0;
			for(var bodypart of body){
				mycost += BODYPART_COST[bodypart]
			}
			return mycost;
		};
		/** Body length function **/
		var body = {			
			harvester : function(maxEnergy){
				var body=[WORK];
				var minEnergy = cost([WORK,MOVE]);
				if(maxEnergy > minEnergy){
				var n = Math.min(Math.floor((maxEnergy - minEnergy)/BODYPART_COST[WORK]),4); //a maximum of 5 WORK parts
					for(i=0; i<n; i++){
					body.push(WORK);
					}
				}
				body.push(MOVE);
				return body;
			},
			worker : function(maxEnergy){
				var template = [WORK,CARRY,MOVE];
				var intervalEnergy = cost(template);
				var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //Max limit number of workers is 10
				var body = [];
				for(i=0;i<n;i++){
					body.push(WORK,CARRY,MOVE);
				}
				return body;
			},
			upgrader : function(maxEnergy){
				return this.worker(maxEnergy);
			},
			repairer : function(maxEnergy){
				return this.worker(maxEnergy);
			},
			hauler : function(maxEnergy){
				var template = [CARRY,MOVE];
				var intervalEnergy=cost(template);
				var n = Math.min(Math.floor(maxEnergy/intervalEnergy),10); //currently hardcapped at 10
				var body = [];
				for(i=0;i<n;i++){
					body.push(CARRY,MOVE);
				}
				return body;
			},
			guard : function(maxEnergy){
				var toughTemplate = [TOUGH,MOVE];
				var toughCost = cost(toughTemplate);
				var attackTemplate = [ATTACK,MOVE];
				var attackCost = cost(attackTemplate);
				var toughNo = Math.min(Math.floor(maxEnergy/12/toughCost),6); //at most 1/12 of energy should go towards TOUGH parts
				var energyLeft = maxEnergy - toughNo * toughCost;
				var attackNo = Math.min(Math.floor(energyLeft/attackCost),19); //no more than 50 body parts
				var body = [];
				for(i=0;i<toughNo;i++){
					body.push(TOUGH);
				}
				for(i=0;i<toughNo;i++){
					body.push(MOVE);
				}
				for(i=0;i<attackNo;i++){
					body.push(...attackTemplate);
				}
				return body;
			},
			healer : function(maxEnergy){
				var toughTemplate = [TOUGH,MOVE];
				var toughCost = cost(toughTemplate);
				var attackTemplate = [HEAL,MOVE];
				var attackCost = cost(attackTemplate);
				var toughNo = Math.min(Math.floor(maxEnergy/12/toughCost),6); //at most 1/12 of energy should go towards TOUGH parts
				var energyLeft = maxEnergy - toughNo * toughCost;
				var attackNo = Math.min(Math.floor(energyLeft/attackCost),19); //no more than 50 body parts
				var body = [];
				for(i=0;i<toughNo;i++){
					body.push(TOUGH);
				}
				for(i=0;i<toughNo;i++){
					body.push(MOVE);
				}
				for(i=0;i<attackNo;i++){
					body.push(...attackTemplate);
				}
				return body;
			},
			remharvester : function(maxEnergy){
				return [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE];
			},
			remhauler : function(maxEnergy){
				var template = [CARRY,MOVE];
				var intervalEnergy=cost(template);
				var n = Math.min(Math.floor((maxEnergy-150)/intervalEnergy),16); //currently hardcapped at 800 carry
				var body = [];
				for(i=0;i<n;i++){
					body.push(CARRY,MOVE);
				}
				body.push(WORK,MOVE);
				return body;
			},
			conqueror : function(maxEnergy){
				var template = [WORK,CARRY,MOVE,MOVE];
				var intervalEnergy = cost(template);
				var n = Math.min(Math.floor(maxEnergy/intervalEnergy),8);
				var body = [];
				for(i=0;i<n;i++){
					body.push(...template);
				}
				return body;
			},
			reserver : function(maxEnergy){
				return [CLAIM,MOVE];
			}
		};
		//Max and current energy available
		var maxEnergy = thisroom.energyCapacityAvailable;
		var currentEnergy = thisroom.energyAvailable;
		//Mineral
		var mineral = thisroom.find(FIND_MINERALS)[0];
		//Number of workers: at least 1, maximally 3, else enough to upgrade ca. 500 per 50 ticks, +1 for every 200k in storage
		let storage = thisroom.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_STORAGE})[0];
		var workers_target = Math.max(Math.min(Math.ceil(20/(body.worker(maxEnergy).length/3))-1,6),1) + ( storage != undefined ? Math.floor(storage.store.energy/200000) : 0 );
		var upgraders_target = 1;
		var reservers_target = 0;
		var haulers_target = 1;
		var harvesters_target = 2;
		var repairers_target = 1;
		var guards_target = 0;
		
		var enemies = thisroom.find(FIND_HOSTILE_CREEPS);		
		var hostiles = enemies.length;
		if(hostiles == 1 && enemies[0].hits > 250) {
			guards_target = 1;
		}
		else if (hostiles > 1) {
			guards_target=Math.ceil(hostiles/2);
		}
		
		//Make sure 1 harvester, 1 hauler, 1 upgrader are always available
		if(harvesters.length < 1) {
			var newName = spawn.createCreep(body.harvester(currentEnergy), undefined, {role: 'harvester', homeRoom: thisroom.name});
            console.log('Spawning new harvester: ' + newName);
		}
		else if(haulers.length < 1) {
				var newName = spawn.createCreep(body.hauler(currentEnergy), undefined, {role: 'hauler', homeRoom: thisroom.name});
                console.log('Spawning new hauler: ' + newName);
		}
		else if(upgraders.length < 1 && thisroom.controller.ticksToDowngrade < 500) {
			var newName = spawn.createCreep(body.upgrader(currentEnergy), undefined, {role: 'upgrader', homeRoom: thisroom.name});
			console.log('Spawning new upgrader: ' + newName);
		}
		// Other autocreate requests
		/** Autocreate workers **/
		else if(workers.length < workers_target) {
				var newName = spawn.createCreep(body.worker(maxEnergy), undefined, {role: 'worker', homeRoom: thisroom.name});
                console.log('Spawning new worker: ' + newName);
		}
		/** Autocreate harvesters **/
		else if(harvesters.length < harvesters_target) {
			var newName = spawn.createCreep(body.harvester(maxEnergy), undefined, {role: 'harvester', homeRoom: thisroom.name});
            console.log('Spawning new harvester: ' + newName);
		}
		/** Autocreate haulers **/
		else if(haulers.length < haulers_target) {
			var newName = spawn.createCreep(body.hauler(maxEnergy), undefined, {role: 'hauler', homeRoom: thisroom.name});
			console.log('Spawning new hauler: ' + newName);
		}		
		/** Autocreate upgraders **/
		else if(upgraders.length < upgraders_target) {
			var newName = spawn.createCreep(body.upgrader(maxEnergy), undefined, {role: 'upgrader', homeRoom: thisroom.name});
			console.log('Spawning new upgrader: ' + newName);
		}
		/** Autocreate repairer **/
		else if(repairers.length < repairers_target) {
			var newName = spawn.createCreep(body.repairer(maxEnergy), undefined, {role: 'repairer', homeRoom: thisroom.name});
			console.log('Spawning new repairer: ' + newName);			
		}
		/** Autocreate guards **/
		else if(guards.length < guards_target && hostiles > 0) {
			var newName = spawn.createCreep(body.guard(maxEnergy/2), undefined, {role: 'guard', homeRoom: thisroom.name});
			console.log('Spawning new guard: ' + newName);
		}
		else {
			/** Autospawning with flag names **/
			//  Definitions
				var remharvesters_target = 0;
				var remhaulers_target = 0;
				var reservers_target = 2;
				
				for (var flag of _.filter(Game.flags, (f)=>f.memory.homeRoom == thisroom.name)){
					if(/reserve/.test(flag.name)){
						//defend remote room
						if(flag.pos.roomName in Game.rooms){//check to prevent breaking from no vision
							if(flag.room.find(FIND_HOSTILE_CREEPS).length){
								flag.memory.underAttack = true;
							}
							else{
								flag.memory.underAttack = false;
							}
						}
						if(flag.memory.underAttack){
							remharvesters_target = 0;
							remhaulers_target = 0;
							reservers_target = 0;
							var remguards = _.filter(Game.creeps, (c) => c.memory.role == 'remguard' && c.memory.myflag == flag.name).length;
							if(remguards < 2){
								var newName = spawn.createCreep(body.guard(maxEnergy/2),undefined,{role : 'remguard', homeRoom : thisroom.name, myflag : flag.name});								
								console.log('Spawning new remote guard: ' + newName);
							}
						}
						//logic to spawn reservers
						reservers_target = 2; //reservers per remote site
						var reservers = _.filter(Game.creeps, (creep) => creep.memory.role == 'reserver' && creep.memory.myflag == flag.name).length;
						if (reservers < reservers_target){
							var tospawn = false;
							if (flag.memory.reserved && flag.pos.roomName in Game.rooms){ //second check is to prevent breaking from no vision
								var con = _.filter(flag.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTROLLER)[0];
								if(con.reservation == undefined){ //yet more failsafes
									flag.memory.reserved = false;
								}
								else if(con.reservation.ticksToEnd < 2000){
									tospawn = true;
								}
							}
							else{
								if(!flag.memory.reserved && spawn.canCreateCreep(body.reserver(maxEnergy),undefined) == OK){
									tospawn = true;
									flag.memory.reserved = true; //should have some kind of check to prevent breaking
								}
							}
							if(tospawn){
								var newName = spawn.createCreep(body.reserver(maxEnergy),undefined,{role: 'reserver', homeRoom : thisroom.name, myflag: flag.name});
								console.log('Spawning new reserver: ' + newName);
							}
						}
					}
					//see that every remote site has enough harvesters
					if(/harvest/.test(flag.name)){ 
						remharvesters_target = 1; //harvesters per remote site
						remhaulers_target = 0; 
						var remharvesters = _.filter(Game.creeps, (creep) =>
							creep.memory.role == 'remharvester' && creep.memory.myflag == flag.name //should be spawned early, but my check is too stupid
						).length;
						var remhaulers = _.filter(Game.creeps, (creep) =>
							creep.memory.role == 'remhauler' && creep.memory.myflag == flag.name //should be spawned early, but my check is too stupid
						).length;
						// spawn required remote harvesters
						if (remharvesters < remharvesters_target)
						{
							var newName = spawn.createCreep(body.remharvester(maxEnergy),undefined,{role: 'remharvester', homeRoom: thisroom.name, myflag: flag.name});
							console.log('Spawning new remote harvester: ' + newName);
						}
						
						if(flag.pos.roomName in Game.rooms) //check to prevent breaking from no vision
						{
							if(remharvesters == remharvesters_target) 
							{
								var myContainer = flag.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
								var myDropped = flag.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
								var myEnergy = ( myContainer != undefined ? myContainer.store.energy : 0 ) + ( myDropped != undefined ? myDropped.amount : 0 );
								if(myContainer != undefined)
								{
									remhaulers_target = 1 + Math.floor(myEnergy/2000); //haulers per remote site									
								}
								else
								{
									remhaulers_target = 0;
								}
							}
						}
						// spawn required remote haulers
						if (remhaulers < remhaulers_target){
							var newName = spawn.createCreep(body.remhauler(maxEnergy),undefined,{role: 'remhauler', homeRoom: thisroom.name, myflag: flag.name});
							console.log('Spawning new remote hauler: ' + newName);
						}						
					}
					if(/steal/.test(flag.name)){
						var remhaulers_target = 0; //haulers per remote site
						var remhaulers = _.filter(Game.creeps, (creep) =>
							creep.memory.role == 'remhauler' && creep.memory.myflag == flag.name //should be spawned early, but my check is too stupid
						).length;
							if(flag.pos.roomName in Game.rooms){
								var myContainer = flag.pos.findInRange(FIND_STRUCTURES,3,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
								var myDropped = flag.pos.findInRange(FIND_DROPPED_RESOURCES,3)[0];
								var myEnergy = ( myContainer != undefined ? myContainer.store.energy : 0 ) + ( myDropped != undefined ? myDropped.amount : 0 );
								if(myContainer == undefined){
									remhaulers_target = 0;
								}
								else {
									remhaulers_target = 1 + Math.floor(myEnergy/2000);
								}
							}
							if(remhaulers < remhaulers_target){
								var newName = spawn.createCreep(body.remhauler(maxEnergy),undefined,{role: 'remhauler', homeRoom: thisroom.name, myflag: flag.name});
								console.log('Spawning new remote hauler: ' + newName);
							}
					}
					if(/claim/.test(flag)){ 
						//continously respawn colonists to help establish the new room until flag is removed
						var conquerors = _.filter(Game.creeps,(creep) =>
							creep.memory.role == 'conqueror' && creep.memory.myflag == flag.name
						).length;
						if (conquerors < 1){
							var newName = spawn.createCreep(body.conqueror(maxEnergy),undefined,{role : 'conqueror', homeRoom: thisroom.name, myflag : flag.name});
							console.log('Spawning new conqueror: ' + newName);
						}
						//defend remote room
						if(flag.pos.roomName in Game.rooms){//check to prevent breaking from no vision
							if(flag.room.find(FIND_HOSTILE_CREEPS).length){
								flag.memory.underAttack = true;
							}
							else{
								flag.memory.underAttack = false;
							}
						}
						if(flag.memory.underAttack){
							reservers_target = 0;
							var remguards = _.filter(Game.creeps, (c) => c.memory.role == 'remguard' && c.memory.myflag == flag.name).length;
							if(remguards < 2){
								var newName = spawn.createCreep(body.guard(maxEnergy/2),undefined,{role : 'remguard', homeRoom : thisroom.name, myflag : flag.name});								
								console.log('Spawning new remote guard: ' + newName);
							}
						}
						//logic to spawn reservers
						if (creep.room.controller.owner != undefined) reservers_target = 0;
						var reservers = _.filter(Game.creeps, (creep) => creep.memory.role == 'reserver' && creep.memory.myflag == flag.name).length;
						if (reservers < reservers_target){
							var tospawn = false;
							if (flag.memory.reserved && flag.pos.roomName in Game.rooms){ //second check is to prevent breaking from no vision
								var con = _.filter(flag.pos.lookFor(LOOK_STRUCTURES), (s) => s.structureType == STRUCTURE_CONTROLLER)[0];
								if(con.reservation == undefined){ //yet more failsafes
									flag.memory.reserved = false;
								}
								else if(con.reservation.ticksToEnd < 500){
									tospawn = true;
								}
							}
							else{
								if(!flag.memory.reserved && spawn.canCreateCreep(body.reserver(maxEnergy),undefined) == OK){
									tospawn = true;
									flag.memory.reserved = true; //should have some kind of check to prevent breaking
								}
							}
							if(tospawn){
								var newName = spawn.createCreep(body.reserver(maxEnergy),undefined,{role: 'reserver', homeRoom : thisroom.name, myflag: flag.name});
								console.log('Spawning new reserver: ' + newName);
							}
						}
					}
					if(/kill/.test(flag.name)){
						var killers_target = 1;
						var healers_target = 0;
						var killers = _.filter(Game.creeps, (creep) =>
							creep.memory.role == 'killer' && creep.memory.myflag == flag.name //should be spawned early, but my check is too stupid
						).length;
						var healers = _.filter(Game.creeps, (creep) =>
							creep.memory.role == 'healer' && creep.memory.myflag == flag.name //should be spawned early, but my check is too stupid
						).length;
						if(killers < killers_target){
							var newName = spawn.createCreep(body.guard(maxEnergy),undefined,{role: 'killer', homeRoom: thisroom.name, myflag: flag.name});
							console.log('Spawning new killer: ' + newName);
						}
						else if(healers < healers_target){
							var newName = spawn.createCreep(body.healer(maxEnergy),undefined,{role: 'healer', homeRoom: thisroom.name, myflag: flag.name});
							console.log('Spawning new healers: ' + newName);
						}
					}
				}
		}
    }
};

module.exports = structSpawn;