import Person, { PersonProps } from './person';
import { CollideableGameObject, Faction } from '../../types/objects';
import { BehaviorWeights, WeightedObject } from '../../../aibehavior/BehaviorWeights';
import AggroObject from '../../../aibehavior/AggroObject';
import EngineState from '../../../EngineState';
import BaseAI, { IBaseAI } from '../ai/baseAI';
import Fireball from '../../projectiles/fireball';

interface AIProps extends PersonProps {
	faction: Faction;
	ai: BaseAI;
}

// TODO: Make more values configurable, set appropriate defaults
export default class AI extends Person {
	aiBehaviors: BehaviorWeights;
	currentTarget: WeightedObject;
	aggroObj: AggroObject;
	aggroRange = 1000;
	initializedAi = false;
	attentionSpan = 1200;
	currentAttentionSpan = 0;
	ai: BaseAI;
	faction = Faction.ENEMY;
	width = 32;
	height = 32;
	initialHealth = 5000;
	health = 5000;
	movementSpeed = 20;
	weapon = Fireball;

	constructor(ai: IBaseAI, { sprite, ...personProps }: PersonProps & { sprite: string }) {
		super({ sprite, ...personProps });
		this.ai = new ai(this);
	}

	initializeAi() {
		this.aggroObj = new AggroObject({
			owner: this,
			aggroRange: this.aggroRange,
			maxAggroRange: this.aggroRange * 2,
		});
		EngineState.world.addGameObject(this.aggroObj);
		this.initializedAi = true;
	}

	update({ xDiff, yDiff }) {
		if (!this.initializedAi) this.initializeAi();

		// If no target, we can trigger attention span recheck immediately
		if (!this.currentTarget) this.currentAttentionSpan = this.attentionSpan;

		// Increase current attention span.
		if (this.currentAttentionSpan < this.attentionSpan) {
			this.currentAttentionSpan += EngineState.timeStep.frameTimeMS;
		}

		this.ai.aiUpdate();
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
		// Call setPosition on the aggroObj
		this.aggroObj.x = x;
		this.aggroObj.y = y;
	}

	weighTargets(targets: CollideableGameObject[]) {
		// Only recheck targets if attention span recheck is initiated
		if (this.currentAttentionSpan >= this.attentionSpan) {
			this.currentAttentionSpan = 0;
			const weightedTargets: WeightedObject[] = targets.map((target) => {
				const rules = this.ai.getBehaviorRules();
				const targetWeights: BehaviorWeights = {};

				rules.forEach((rule) => {
					targetWeights[rule.behaviorWeight] = targetWeights[rule.behaviorWeight] || 0;
					targetWeights[rule.behaviorWeight] += rule.run(this, target);
				});

				return { weights: targetWeights, target };
			});

			// Remove current target if no targets in aggro range
			// If targets, update current target based on weights
			if (!weightedTargets.length) {
				this.currentTarget = null;
			} else {
				this.ai.updateTarget(weightedTargets);
			}
		}
	}
}
