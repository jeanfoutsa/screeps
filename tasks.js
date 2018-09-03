module.exports = {	
	recycle : function(creep,spawn){
		if(spawn != undefined){
			if(spawn.recycleCreep(creep) == ERR_NOT_IN_RANGE){
				creep.moveTo(spawn);
			}
		}
		else{
			creep.drop(RESOURCE_ENERGY);
			creep.suicide();
		}
	},	
	gototarget : function(creep,target){
		if (!creep.memory.path) {
			creep.memory.path = creep.pos.findPathTo(target);
		}
		if (creep.moveByPath(creep.memory.path) == ERR_NOT_FOUND) {
			creep.memory.path = creep.pos.findPathTo(target);
			creep.moveByPath(creep.memory.path);
		}
	},
	mine : function(creep,target){
		var mycontainer = target.pos.findInRange(FIND_STRUCTURES,1,{filter: (s)=> s.structureType == STRUCTURE_CONTAINER});
		if(mycontainer.length){
			creep.harvest(target);
			creep.moveTo(mycontainer[0]);
		}
		else{
			if(creep.harvest(target) == ERR_NOT_IN_RANGE ||
			creep.harvest(target) == ERR_NOT_ENOUGH_RESOURCES ||
			creep.harvest(target) == ERR_BUSY ){
				creep.moveTo(target);
			}
		}
	},
	pick : function(creep,target){
		var action = creep.pickup(target);
		if(action == ERR_NOT_IN_RANGE){
			creep.moveTo(target);
		}
		return action;
	},
	takeNRG : function(creep,target){
		var action = creep.withdraw(target,RESOURCE_ENERGY);
		if(action == ERR_NOT_IN_RANGE){
			creep.moveTo(target);
		}
		return action;
	},
	construct : function(creep,target){
		if(creep.build(target)==ERR_NOT_IN_RANGE){
			creep.moveTo(target);
		}
	},
	whatsource : function(creep){
		var stdNo = creep.room.memory[creep.memory.role + 'Source'];
		if(stdNo == undefined){
			switch (creep.memory.role){
				case 'worker':
					stdNo = 0;
					break;
				case 'hauler':
					stdNo = 1;
					break;
				case 'upgrader':
					stdNo = 0;
					break;
				case 'repairer':
					stdNo = 0;
					break;
				default:
					stdNo = 0;
					break;
			}
		}
		var sources = creep.room.find(FIND_SOURCES);
		var stdSource = sources[stdNo];
		var otherNo = (stdNo == 1) ? 0 : 1;
		var otherSource = sources[otherNo];
		var stdContainer = stdSource.pos.findInRange(FIND_STRUCTURES,1,{filter : (s) => s.structureType == STRUCTURE_CONTAINER})[0];
		var stdDropped = stdSource.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
		var stdEnergy = ( stdContainer != undefined && stdContainer.store.energy != undefined ? stdContainer.store.energy : 0 ) + ( stdDropped != undefined ? stdDropped.amount : 0 );
		var otherContainer = otherSource.pos.findInRange(FIND_STRUCTURES,1,{filter : (s) => s.structureType == STRUCTURE_CONTAINER})[0];
		var otherDropped = otherSource.pos.findInRange(FIND_DROPPED_RESOURCES,1)[0];
		var otherEnergy = ( otherContainer != undefined && otherContainer.store.energy != undefined ? otherContainer.store.energy : 0 ) + ( otherDropped != undefined ? otherDropped.amount : 0 );
		var threshold = 1000;
		if(otherEnergy > threshold && (otherEnergy-threshold) > stdEnergy){
			return otherNo;
		}
		else{
			return stdNo;
		}
	},
	gogetNRG : function(creep){ //go get NRG in priority: dropped, container, storage, harvest
		var sourceNr = creep.memory.sourceNr;
		if(sourceNr == undefined){ //determine what source location to use
			sourceNr = this.whatsource(creep);
			creep.memory.sourceNr = sourceNr;
		}
		var sources = creep.room.find(FIND_SOURCES);
		var mysource = sources[sourceNr];
		var mycontainer = mysource.pos.findInRange(FIND_STRUCTURES,1,{filter: (s) => s.structureType == STRUCTURE_CONTAINER})[0];
		var stock = creep.room.find(FIND_STRUCTURES,{filter: (s) => s.structureType == STRUCTURE_STORAGE && s.store.energy > 0});

		var targets = mysource.pos.findInRange(FIND_DROPPED_RESOURCES,3);
		if (mycontainer != undefined && mycontainer.store.energy == mycontainer.storeCapacity){ //fixes container overflowing
			this.takeNRG(creep,mycontainer);
		}
		else if (targets.length){
			this.pick(creep,targets[0]);
		}
		else if(mycontainer != undefined && mycontainer.store.energy >= creep.carryCapacity - (creep.carry.energy != undefined ? creep.carry.energy : 0) ){
			this.takeNRG(creep,mycontainer);
		}
		else if(stock.length){
			this.takeNRG(creep,stock[0]);
		}
		else if(creep.getActiveBodyparts(WORK)){
			this.mine(creep,mysource);
		}
	},
	giveNRG : function(creep,prioritylist){
		var valid = false; //use this to determine whether there was some sensible task to do
		for(i=0; i<prioritylist.length; i++){
		    if(prioritylist[i]==STRUCTURE_CONTAINER || prioritylist[i]==STRUCTURE_STORAGE){
		        var target=creep.room.find(FIND_STRUCTURES, {
				    filter: (s) => s.structureType == prioritylist[i] && (s.store.energy<s.storeCapacity)
			    })[0];
		    }
		    else{
    			var target=creep.pos.findClosestByRange(FIND_STRUCTURES, {
    				filter: (s) => s.structureType == prioritylist[i] && (s.energy < s.energyCapacity)
    			});
		    }
    		if(target != null){
				if(creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
					creep.moveTo(target);
				}
				valid = true;
				break;
			}
		}
		if(!valid){
			return -1;
		}
	}
}