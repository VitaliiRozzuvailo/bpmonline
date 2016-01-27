define('GraphicUtilities', ['ext-base', 'terrasoft'],
	function(Ext, Terrasoft) {
		return {
			getP1: function(x, y, width, height) {
				return {x: x + width + 1, y: y + height / 2};
			},
			getP2: function(x, y, width, height) {
				return {x: x + width / 2, y: y - 1};
			},
			getP3: function(x, y, width, height) {
				return {x: x - 1, y: y + height / 2};
			},
			getP4: function(x, y, width, height) {
				return {x: x + width / 2, y: y + height + 1};
			},
			getRectVertices: function(x, y, width, height) {
				return [this.getP2(x, y, width, height),
					this.getP4(x, y, width, height),
					this.getP3(x, y, width, height),
					this.getP1(x, y, width, height)];
			},
			getPathPoints: function(x1, y1, width1, height1, x2, y2, width2, height2) {
				var p = this.getRectVertices(x1, y1, width1, height1);
				var sh2Points = this.getRectVertices(x2, y2, width2, height2);
				for (var point in sh2Points) {
					p.push(sh2Points[point]);
				}
				var d = {}, dis = [];
				var dx, dy;
				for (var i = 0; i < 4; i++) {
					for (var j = 4; j < 8; j++) {
						dx = Math.abs(p[i].x - p[j].x);
						dy = Math.abs(p[i].y - p[j].y);
						if ((i === j - 4) || (((i !== 3 && j !== 6) || p[i].x < p[j].x) &&
								((i !== 2 && j !== 7) || p[i].x > p[j].x) &&
								((i !== 0 && j !== 5) || p[i].y > p[j].y) &&
								((i !== 1 && j !== 4) || p[i].y < p[j].y))) {
							dis.push(dx + dy);
							d[dis[dis.length - 1]] = [i, j];
						}
					}
				}
				var res = dis.length === 0 ? [0, 4] : d[Math.min.apply(Math, dis)];
				x1 = p[res[0]].x;
				y1 = p[res[0]].y;
				var x4 = p[res[1]].x,
					y4 = p[res[1]].y;
				dx = Math.max(Math.abs(x1 - x4) / 2, 10);
				dy = Math.max(Math.abs(y1 - y4) / 2, 10);
				x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3);
				y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3);
				var x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
					y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
				return {
					x1: x1,
					y1: y1,
					x4: x4,
					y4: y4,
					x2: x2,
					y2:	y2,
					x3: x3,
					y3: y3
				};
			}
		};
	}
);