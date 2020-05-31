import Person, { PersonProps } from './person';
import { CollideableGameObject, Faction, EntityType } from '../../types/objects';
import { BehaviorWeights, WeightedObject } from '../../../aibehavior/BehaviorWeights';
import AggroObject from '../../../aibehavior/AggroObject';
import EngineState from '../../../EngineState';
import BaseAI, { IBaseAI } from '../ai/baseAI';
import ProjectileTypes, { ProjectileType } from '../../projectileTypes';
import { AIType } from '../../aiTypes';

interface AIProps {
	width?: number;
	height?: number;
	maxHealth: number;
	aggroRange?: number;
	attentionSpan?: number;
}

// TODO: This needs to emulate player action events, so we can send the events from the server to the client
// Will still need to check specific coords and resync where appropriate, but
// sending simulated inputs of AI makes sense
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
	maxHealth = 5000;
	health;
	movementSpeed = 20;
	weapon = ProjectileTypes[ProjectileType.Fireball];
	entityType = EntityType.AI;
	aiType: AIType;

	constructor(aiType: AIType, ai: IBaseAI, props: PersonProps & AIProps) {
		super(props);
		this.aiType = aiType;

		const setProp = (prop) => {
			if (props[prop]) {
				this[prop] = props[prop];
			}
		};
		['width', 'height', 'maxHealth', 'aggroRange', 'attentionSpan'].forEach(setProp);

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
