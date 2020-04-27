export function Clamp(number, min, max) {
	return Math.min(Math.max(number, min), max);
}

// Below functions copied from Phaser so we don't have to import phaser
export function DistanceBetweenPoints(a, b) {
	var dx = a.x - b.x;
	var dy = a.y - b.y;

	return Math.sqrt(dx * dx + dy * dy);
}

export function AngleBetweenPoints(point1, point2) {
	return Math.atan2(point2.y - point1.y, point2.x - point1.x);
}

export function RectangleToRectangle(rectA, rectB) {
	if (rectA.width <= 0 || rectA.height <= 0 || rectB.width <= 0 || rectB.height <= 0) {
		return false;
	}

	return !(
		rectA.right < rectB.x ||
		rectA.bottom < rectB.y ||
		rectA.x > rectB.right ||
		rectA.y > rectB.bottom
	);
}

export function CircleToRectangle(circle, rect) {
	var halfWidth = rect.width / 2;
	var halfHeight = rect.height / 2;

	var cx = Math.abs(circle.x - rect.x - halfWidth);
	var cy = Math.abs(circle.y - rect.y - halfHeight);
	var xDist = halfWidth + circle.radius;
	var yDist = halfHeight + circle.radius;

	if (cx > xDist || cy > yDist) {
		return false;
	} else if (cx <= halfWidth || cy <= halfHeight) {
		return true;
	} else {
		var xCornerDist = cx - halfWidth;
		var yCornerDist = cy - halfHeight;
		var xCornerDistSq = xCornerDist * xCornerDist;
		var yCornerDistSq = yCornerDist * yCornerDist;
		var maxCornerDistSq = circle.radius * circle.radius;

		return xCornerDistSq + yCornerDistSq <= maxCornerDistSq;
	}
}
