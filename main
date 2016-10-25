var roleWorker = require('role.worker');

module.exports.loop = function () {
	
	var CPUstart = Game.cpu.getUsed()
    console.log('### Game tick ' + Game.time)
    console.log('CPU spent at start:', CPUstart)

    for(var name in Game.rooms) {
        console.log('Room "'+name+'" has '+Game.rooms[name].energyAvailable+' energy');
    }
	
    /** Clear unassigned creep names from memory **/
	for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
	/** Autocreate workers **/
    var workers = _.filter(Game.creeps, (creep) => creep.memory.role == 'worker');
    console.log('workers: ' + workers.length);

    if(workers.length < 5) {
		for(var name in Game.rooms) {
			if(Game.rooms[name].energyAvailable > 549) {
				var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE], undefined, {role: 'worker'});
                console.log('Spawning new worker: ' + newName);
			}
			if(Game.rooms[name].energyAvailable > 399 && Game.rooms[name].energyAvailable < 549) {
				var newName = Game.spawns['Spawn1'].createCreep([WORK,WORK,CARRY,MOVE,MOVE,MOVE], undefined, {role: 'worker'});
				console.log('Spawning new worker: ' + newName);
			}
			if(Game.rooms[name].energyAvailable < 301) {
				var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE,MOVE], undefined, {role: 'worker'});
                console.log('Spawning new worker: ' + newName);
			}
		}
    }

    /** Tower code **/
    var tower = Game.getObjectById('TOWER_ID');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
	
    /** Execute creep roles **/
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'worker') {
            roleWorker.run(creep);
        }
    }
	
	var CPUend = Game.cpu.getUsed() - CPUstart
    console.log('CPU spent at end', CPUend)
}
