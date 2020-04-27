This file describes how AI and aggro should work.

Every AI should have a circular"AggroRadius" game object that it creates in its constructor.
The AggroRadius object follows the position of the original game object [the AI].

On world collision tick, every item that collides (not just the first item),
should be added to an array and passed to a `triggerAggro` method on the AggroRadius object.

The AggroRadius object will then trigger the `updateBehavior` method on the enemy game object,
passing along the array of targets.

The updateBehavior method will iterate over all the game objects, invoking specific
simple AggroRules on the enemy game object, each rule modifying one AI behavior weight type,
e.g. attack, run away, etc.
Aggro rules should be simple, e.g.:
- AttackDistanceRule, update attack weight by how close/far the iterated game object
- AttackHealthRule, update attack weight by the health percentage of the iterated game object, e.g. prioritizing low health targets
- HealAllyHealthRule, update ally heal weight (for AI that can heal) by the health percentage of their allied iterated game object
- RunHealthRule, update run away weight by the game object's own health

The enemy game object's `updateBehavior` method will look at the object[s] with the highest
behavior weights, calculated however that specific enemy game object wants to,
and then set its currentTarget and currentBehaviors.

On every tick, the enemy game object will look at its current target and behaviors and,
based off the weights, have a random chance based on the weights to do the weighted actions.
Some of the weighted actions may also be configured to not happen if they are weighted low enough.
This means it's possible for multiple actions to occur in one tick, e.g. running away and attacking, i.e. kiting.
This does mean that the enemy game object is responsible for exactly how it executes the behaviors it's suposed to do.

Every AI game object will have an `attentionSpan` in millisecond, dictating how long they should
continue doing their current action before re-calculating which behaviors and current target they
should be doing.