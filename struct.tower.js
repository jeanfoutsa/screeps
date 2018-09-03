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

const structTower = {
	
    /** Tower function **/
    run: function(tower) {
		// Exit if low on energy
        if (tower.energy < 10) return;
        
		// Find hostiles and attack
        const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		
        if(closestHostile)
		{
            tower.attack(closestHostile);
            return;
        }
        
		// Repair buildings except walls first
        const closestDamagedBuilding = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (s) => s.structureType != STRUCTURE_WALL && 
				s.structureType != STRUCTURE_RAMPART &&
				s.hits + 2500 < s.hitsMax
        });
        if(closestDamagedBuilding)
		{
            tower.repair(closestDamagedBuilding);
            return;
        }
        
		// Repair lowest health wall or rempart
		let walls = tower.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits + 2500 < 10000});
		let closestDamagedWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits + 2500 < 10000});
		
		if(tower.room.controller.level < 4)
		{
			walls = tower.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits + 2500 < 200000});		
			closestDamagedWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits + 2500 < 200000});
		}
		else
		{
			walls = tower.room.find(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits + 2500 < 1000000});		
			closestDamagedWall = tower.pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits + 2500 < 1000000});
		}
		
		if(walls.length > 1)
		{
			let lowest_wall = walls[0];
			for (let wall of walls) 
			{
				// Look for wall with lowest health
				if (wall.hits <= lowest_wall.hits) 
				{
					lowest_wall = wall;
				}
			}
			if(lowest_wall)
			{
				tower.repair(lowest_wall);
				return;
			}
		}
		
		// Repair closet damaged wall or rempart
		
		if(closestDamagedWall)
		{
			tower.repair(closestDamagedWall);
			return;	
		}
    }
};

module.exports = structTower;