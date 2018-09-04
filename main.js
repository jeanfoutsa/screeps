// @formatter:off

/**
//
// _________________________________________________________
//                                          ___              
//            |\ |   |   |    |_/    |_|   |   |             
//            | \|   |___|    | |     |    |___|             
//                                                          
//______________________ Screeps AI ________________________
//
//
//
**/

// Code should be executed in "strict mode" as it make it easier to write "secure" JavaScript.
"use strict";

// @formatter:on

// Require all ==============================================================================================
const errorHandling = require('error.handling');
const structTower = require('struct.tower');
const structSpawn = require('struct.spawn');
const tasks = require('tasks');
const safemode = require('safemode');

global.load = _.round(Game.cpu.getUsed());

console.log(Game.time, 'Script reload', 'Load: ' + global.load, 'Bucket: ' + Game.cpu.bucket);

module.exports.loop = function () {
	
	const CPUstart = Game.cpu.getUsed();
    console.log('##### Game tick ' + Game.time + ' #####');
    console.log('CPU used at start:', CPUstart);
	
    /** Clear unassigned creep names from memory **/
    for(var flagName in Memory.flags) {
        if(!Game.flags[flagName]) {
            delete Memory.flags[flagName];
            console.log('Clearing non-existing flag memory:', flagName);
        }
    }
	
    /** Clear unassigned creep names from memory **/
	for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
			try {
                var roleFile = require('role.' + Memory.creeps[name].role);
                if (roleFile.onCreepDied)
                    roleFile.onCreepDied(name);
            }
            catch(error) { errorHandling.print(error) }
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
		
    /** Run rooms structures **/
	for(var r in Game.rooms) {
		if (Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == 'Nukyo') {
			var thisroom = Game.rooms[r];
			console.log('Room '+thisroom.name+' has '+thisroom.energyAvailable+' energy.');
			var towers = thisroom.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
			for(var i in towers) {
				var tower = towers[i];
				if(tower) {
					try {
						structTower.run(tower);
					}
					catch(error) { errorHandling.print(error) }
				}
			}
			var spawns = thisroom.find(FIND_STRUCTURES, {filter : (s) => s.structureType == STRUCTURE_SPAWN && s.spawning == null});
			for(var i in spawns) {
				var spawn = spawns[i];
				if(spawn != undefined) {
					try {
						structSpawn.run(spawn,thisroom);
					}
					catch(error) { errorHandling.print(error) }
				}
			}
			/** Safe mode **/
			try {
				safemode.run(thisroom);
			}
			catch(error) { errorHandling.print(error) }
		}
	}
	
    /** Execute creep roles **/
    for(var name in Game.creeps) {
        try {
            var creep = Game.creeps[name];
            if (!creep.spawning) {
                require('role.' + creep.memory.role).run(creep);
            }
        }
        catch(error) { errorHandling.print(error) }
    }
	
	const CPUend = Game.cpu.getUsed() - CPUstart;
    console.log('CPU used at end', CPUend);
}