define("QuickModelDiagramModule", ["ProcessLibraryConstants", "ej-diagram", "jsrender"],
	function(ProcessLibraryConstants) {
	Ext.define("Terrasoft.configuration.QuickModelDiagramModule", {
		// jshint bitwise:false
		extend: "Terrasoft.BaseModule",
		alternateClassName: "Terrasoft.QuickModelDiagramModule",
		Ext: null,
		Terrasoft: null,
		sandbox: null,
		SCROLL_HEIGHT: 10,
		TASK_WIDTH: 70,
		TASK_HEIGHT: 56,
		HORIZONTAL_SPACE: 40,
		CAPTION_MARGIN: 2,
		CAPTION_WIDTH: 100,
		CAPTION_BACKCOLOR: "rgba(255, 255, 255, 0.5)",
		MAX_LENGTH_CAPTION: 51,
		FONT_FAMILY: "bpmonline UI",
		FONT_COLOR: "#444444",
		LANE_SET_FILL_COLOR: "#fdf1c1",
		LANE_SET_FONT_SIZE: 12,
		LANE_VERTICAL_SPACE: 5,
		LANE_CAPTION_CONTAINER: "<div class='caption-lane'>{0}</div>",
		LANE_HEIGHT: 150,
		LANESET_WIDTH: 24,
		LANE_WIDTH: 24,
		LANE_FILL_COLOR: "#e5ecfa",
		LANE_FONT_SIZE: 12,
		CONNECTOR_LINE_COLOR: "#a4a4a4",
		CONNECTOR_BRIDGE_SPACE: 8,
		ARROW_WIDTH: 8,
		ARROW_HEIGHT: 5,
		DIAMOND_WIDTH: 14,
		DIAMOND_HEIGHT: 8,
		DIAMOND_FILL_COLOR: "#ffffff",
		ELEMENT_FONT_SIZE: 11,
		TASK_FILL_COLOR: "#d7e1ed",
		EVENT_SIZE: 28,
		START_EVENT_FILL_COLOR: "#dfefd4",
		START_EVENT_BORDER_COLOR: "#68a13a",
		START_EVENT_BORDER_WIDTH: 1,
		TERMINATE_EVENT_BASE_FILL_COLOR: "white",
		TERMINATE_EVENT_BASE_BORDER_WIDTH: 3,
		TERMINATE_EVENT_BASE_BORDER_COLOR: "#f7941e",
		TERMINATE_EVENT_FILL_COLOR: "#f7941e",
		TERMINATE_EVENT_BORDER_WIDTH: 0,
		DEF_DIAGRAM_OFFSET_X: 0,
		USER_TASK_IMAGE_ID: "e2c2a442-f1d4-47e4-9922-25eb584b783a",
		USER_TASK_IMAGE_SIZE: 16,
		USER_TASK_TYPE_IMAGE_SIZE: 32,
		ej: window.Syncfusion,

		PortDirection: {
			Up: "up",
			Right: "right",
			Down: "down",
			Left: "left"
		},

		/**
		 * Селектор контейнера диаграммы
		 * @type {String}
		 */
		renderToSelector: null,
		svgContainerSelector: null,

		/**
		 * Функция инициализации модуля
		 */
		init: function() {
			this.diagramWidth = this.DEF_DIAGRAM_OFFSET_X;
			this.ej.Diagram = this.ej.datavisualization.Diagram;
			this.ej.Diagram.NodeBaseDefaults.constraints = this.ej.Diagram.NodeConstraints.Delete;
			this.ej.Diagram.NodeBaseDefaults.children = [];
			this.sandbox.subscribe("UpdateDiagram", this.onUpdateDiagram, this, [this.sandbox.id]);
			this.sandbox.subscribe("RerenderQuickModelDiagramModule", function(config) {
				this.render(Ext.get(config.renderTo));
				return true;
			}, this, [this.sandbox.id]);
			this.customizeSyncfusion();
		},

		/**
		 * Перекрывает стандартное поведение библиотеки Syncfusion
		 */
		customizeSyncfusion: function() {
			// TODO Выключаем настройку по умолчанию скролинга по оси Y на 30 пикселей
			this.ej.Diagram.prototype._scrollPixel = 0;
			// TODO Перекрыт метод "_viewPort". Если включены скролы Terrasoft диаграмма не рисует область за скролом
			this.ej.Diagram.ScrollUtil._viewPort = function(diagram) {
				var element = diagram.element[0];
				var eWidth = $("#" + diagram._canvas.id).width();
				var eHeight = $(element).height();
				var bRect = diagram.element[0].getBoundingClientRect();
				var screenX = (window.screenX < 0) ? window.screenX * -1 : window.screenX;
				if (eWidth === 0) {
					eWidth = Math.floor(((window.innerWidth - screenX) - Math.floor(bRect.left)));
				}
				var screenY = (window.screenY < 0) ? window.screenY * -1 : window.screenY;
				if (eHeight === 0) {
					eHeight = Math.floor(((window.innerHeight - screenY) - Math.floor(bRect.top)));
				}
				/* global ej: false */
				return ej.Diagram.Size(eWidth, eHeight);
			};
			this.customizeRenderHtmlElement();
		},

		/**
		 * Перекрывает отрисовку элемента через свойство html (старый вариант отрисовки заголовка пулов и дорожек)
		 */
		/* jshint ignore:start */
		customizeRenderHtmlElement: function() {
			this.ej.Diagram.SvgContext._renderHtmlElement = function(node, svg, g) {
				var backRect = this._renderBackgroundRect(node, svg);
				g.appendChild(backRect);
				if ((node.shape && node.shape.templateId) || node.shape.html) {
					var x = node.offsetX - node.width * node.pivot.x;
					var y = node.offsetY - node.height * node.pivot.y;
					var div = document.createElement("div");
					var style = "width:" + node.width + "px;height:" + node.height + "px;padding:1px; opacity:" +
						node.opacity + ";left:" + x + "px; top:" + y + "px; ";
					if (ej.browserInfo().name === "msie")
						style += "display: block; position: absolute; border:0px;";
					var attr = { "id": node.name + "_html", "class": "foreignObject", "style": style };
					ej.datavisualization.Diagram.Util.attr(div, attr);
					if (node.shape && node.shape.templateId) {
						var tmplString = this._renderHTMLTemplate(node)
						div.innerHTML = tmplString;
					} else if (node.shape.html) { // Поддержка старого варианта
						if (node.shape.html instanceof HTMLElement) {
							div.appendChild(node.shape.html);
						} else {
							div.innerHTML = node.shape.html.toString();
						}
					}
					if (ej.browserInfo().name === "msie") {
						var parentdiv = document.createElement("div");
						var attr1 = { "id": node.name + "_parentdiv", "class": "ej-d-node" };
						ej.datavisualization.Diagram.Util.attr(parentdiv, attr1);
						parentdiv.appendChild(div);
						var htmlLayer = svg.document.parentNode.getElementsByClassName("htmlLayer")[0];
						if (htmlLayer)
							htmlLayer.appendChild(parentdiv);
						else
							svg.document.parentNode.appendChild(div);
					}
					else {
						attr = { "id": node.name + "_shape", "width": node.width, "height": node.height,
							"style": "pointer-events:none" };
						var shape = svg.foreignObject(attr);
						shape.appendChild(div);
						g.appendChild(shape);
					}
				}
			};
		},
		/* jshint ignore:end */

		/**
		 * Функция отрисовки модуля.
		 * @param {Ext.Element} renderTo контейнер для отрисовки модуля.
		 */
		render: function(renderTo) {
			this.renderToSelector = renderTo.id;
			this.svgContainerSelector = this.renderToSelector + "_canvas_svg";
			var view = this.getView();
			var viewModel = this.getViewModel();
			view.bind(viewModel);
			view.render(renderTo);
		},

		/**
		 * Обработчик события обновления диаграммы процесса
		 * @param {Terrasoft.Collection} flowElements Конфиг шагов процесса
		 */
		onUpdateDiagram: function(flowElements) {
			this.drawDiagram(this.createDiagramConfig(flowElements));
		},

		/**
		 * Отрисовка диаграммы процесса
		 * @private
		 * @param {Terrasoft.Collection} flowElements Конфиг шагов процесса
		 * @returns {Object} Конфиг элементов диаграммы
		 */
		createDiagramConfig: function(flowElements) {
			var diagramConfig = {
				"laneSet": {},
				"lanes": [],
				"startEvent": {},
				"endEvent": {},
				"flowElements": [],
				"sequenceFlows": []
			};
			var firstStep = null;
			Terrasoft.each(flowElements, function(item) {
				switch (item.column) {
					case "Caption":
						diagramConfig.laneSet = this.createLaneSetConfig(item);
						break;
					case "Start":
						diagramConfig.startEvent = this.createEventConfig(item);
						diagramConfig.startEvent.lane = this.forceGetLane(diagramConfig, item);
						diagramConfig.startEvent.position.x = 0;
						diagramConfig.startEvent.position.y = 0;
						break;
					case "End":
						diagramConfig.endEvent = this.createEventConfig(item);
						diagramConfig.endEvent.lane = this.forceGetLane(diagramConfig, item);
						break;
					default:
						var userTask = this.createUserTaskConfig(item);
						userTask.lane = this.forceGetLane(diagramConfig, item);
						diagramConfig.flowElements.push(userTask);
						if (!firstStep) {
							firstStep = userTask;
						}
						break;
				}
			}, this);
			if (!firstStep) {
				firstStep = diagramConfig.endEvent;
			}
			diagramConfig.sequenceFlows.push(
				this.createSequenceFlowConfig(ProcessLibraryConstants.SequenceFlowType.SequenceFlow,
					diagramConfig.startEvent, firstStep));
			Terrasoft.each(diagramConfig.flowElements, function(flowElement) {
				if (flowElement.nextStep && flowElement.nextStep.value) {
					if (flowElement.nextStep.value === ProcessLibraryConstants.GatewayStepValue.value) {
						if (flowElement.conditions) {
							diagramConfig.sequenceFlows = diagramConfig.sequenceFlows.concat(
								this.createXorGatewayFlows(diagramConfig, flowElement));
						}
						return true;
					}
					var nextStep = this.findFlowElementByUid(diagramConfig, flowElement.nextStep.value);
					diagramConfig.sequenceFlows.push(
						this.createSequenceFlowConfig(ProcessLibraryConstants.SequenceFlowType.SequenceFlow,
							flowElement, nextStep));
				}
			}, this);
			this.linkStartedFlowElements(diagramConfig);
			this.setEndEventLane(diagramConfig.endEvent);
			diagramConfig.startEvent.lane.positionMatrix[0][0] = true;
			this.arrangeTargetFlowElements(diagramConfig.startEvent);
			this.calculateLanesHeight(diagramConfig);
			this.arrangeEndEvent(diagramConfig);
			this.arrangePorts(diagramConfig);
			return diagramConfig;
		},

		/**
		 * Возвращает Дорожку для элемента бизнес-процесса, если ее еще нет, то добавляет ее в коллекцию дорожек
		 * @private
		 * @param {Object} diagramConfig Конфиг диаграммы
		 * @param {Object} item Конфиг шага процесса
		 * @returns {Object} Конфиг дорожки
		 */
		forceGetLane: function(diagramConfig, item) {
			var owner = item.owner;
			var lane = this.findLaneConfig(diagramConfig.lanes, owner.value);
			if (!lane) {
				lane = this.createLaneConfig(owner);
				lane.index = diagramConfig.lanes.length;
				diagramConfig.lanes.push(lane);
			}
			return lane;
		},

		/**
		 * Соединяет элементы БП без входящих потоков со Стартовым событием
		 * @private
		 * @param {Object} diagramConfig Конфиг диаграммы
		 */
		linkStartedFlowElements: function(diagramConfig) {
			Terrasoft.each(diagramConfig.flowElements, function(flowElement) {
				if (flowElement.incomingFlows.length === 0) {
					diagramConfig.sequenceFlows.push(
						this.createSequenceFlowConfig(ProcessLibraryConstants.SequenceFlowType.SequenceFlow,
							diagramConfig.startEvent, flowElement));
				}
			}, this);
		},

		/**
		 * Создает разветвляющий шлюз "Исключающее Или" для шага процесса с "Несколькими шагами"
		 * @private
		 * @param {Object} diagramConfig Конфиг диаграммы
		 * @param {Object} flowElement Конфиг шага процесса
		 * @returns {Array} Массив условных потоков шлюза, включая поток по умолчанию
		 */
		createXorGatewayFlows: function(diagramConfig, flowElement) {
			var sequenceFlows = [];
			var xorConditions = flowElement.conditions.xorConditions;
			var conditions = xorConditions.conditions;
			var nextStep = this.findFlowElementByUid(diagramConfig, xorConditions.elseExecuteFlowElement);
			if (nextStep) {
				sequenceFlows.push(this.createSequenceFlowConfig(ProcessLibraryConstants.SequenceFlowType.DefaultFlow,
					flowElement, nextStep));
			}
			for (var i = 0; i < conditions.length; i++) {
				nextStep = this.findFlowElementByUid(diagramConfig, conditions[i].ThenExecuteFlowElement);
				if (!nextStep) {
					continue;
				}
				var conditionalFlowConfig = this.findConditionalFlowByTarget(sequenceFlows, nextStep.name);
				if (!conditionalFlowConfig) {
					conditionalFlowConfig =
						this.createSequenceFlowConfig(ProcessLibraryConstants.SequenceFlowType.ConditionalFlow,
							flowElement, nextStep);
					conditionalFlowConfig.caption = [];
					sequenceFlows.push(conditionalFlowConfig);
				}
				var task = this.findFlowElementByUid(diagramConfig, conditions[i].IfFlowElementCompleted);
				conditionalFlowConfig.caption.push(
					task.caption + " = " + conditions[i].CompletedWithResult.displayValue);
			}
			return sequenceFlows;
		},

		/**
		 * Поиск в массиве потоков условного потока с заданным элементом-приемником
		 * @private
		 * @param {Array} flows Массив потоков управления
		 * @param {Object} targetName Имя элемента, принимающего поток
		 * @returns {Object} Искомый поток или {null}, если поток не найден
		 */
		findConditionalFlowByTarget: function(flows, targetName) {
			for (var i = 0; i < flows.length; i++) {
				var flow = flows[i];
				if (flow.target.name === targetName &&
						flow.type === ProcessLibraryConstants.SequenceFlowType.ConditionalFlow) {
					return flow;
				}
			}
			return null;
		},

		/**
		 * Выравнивает элементы диаграммы относительно текущего элемента. Вызывается рекурсивно
		 * @private
		 * @param {Object} currentFlowElement Текущий элемент
		 */
		arrangeTargetFlowElements: function(currentFlowElement) {
			for (var i = 0; i < currentFlowElement.outgoingFlows.length; i++) {
				var sequenceFlow = currentFlowElement.outgoingFlows[i];
				var targetFlowElement = sequenceFlow.target;
				if (targetFlowElement.position.x > 0) {
					continue;
				}
				var targetLane = targetFlowElement.lane;
				var currentPosition = {
					"x": currentFlowElement.position.x + 1,
					"y": (currentFlowElement.lane === targetLane ? currentFlowElement.position.y : 0)
				};
				if (sequenceFlow.type !== ProcessLibraryConstants.SequenceFlowType.SequenceFlow) {
					targetLane.positionMatrix[currentPosition.x] = true;
				}
				if (i > 0) {
					this.getNewPositionByY(targetLane.positionMatrix, currentPosition);
				} else {
					this.getNewPositionByX(targetLane.positionMatrix, currentPosition);
				}
				targetFlowElement.position.x = currentPosition.x;
				targetFlowElement.position.y = currentPosition.y;
				targetLane.positionMatrix[currentPosition.x][currentPosition.y] = true;
				if (targetLane.rowCount <= currentPosition.y) {
					targetLane.rowCount = currentPosition.y + 1;
				}
				this.arrangeTargetFlowElements(targetFlowElement);
			}
		},

		/**
		 * Устанавливает новую текущую позицию элемента по горизонтали
		 * @private
		 * @param {Object} positionMatrix Матрица позиций Дорожки
		 * @param {Object} position Текущая позиция элемента
		 */
		getNewPositionByX: function(positionMatrix, position) {
			if (this.initNewPositionMatrixColumn(positionMatrix, position.x)) {
				return;
			}
			while (positionMatrix[position.x] === true || positionMatrix[position.x][position.y]) {
				position.x++;
				if (this.initNewPositionMatrixColumn(positionMatrix, position.x)) {
					return;
				}
			}
		},

		/**
		 * Устанавливает новую текущую позицию элемента по вертикали
		 * @private
		 * @param {Object} positionMatrix Матрица позиций Дорожки
		 * @param {Object} position Текущая позиция элемента
		 */
		getNewPositionByY: function(positionMatrix, position) {
			while (positionMatrix[position.x] === true) {
				position.x++;
				this.initNewPositionMatrixColumn(positionMatrix, position.x);
			}
			if (this.initNewPositionMatrixColumn(positionMatrix, position.x)) {
				return;
			}
			while (positionMatrix[position.x][position.y]) {
				position.y++;
			}
		},

		/**
		 * Инициализирует новую колонку в матрице позиций, если ее еще нет
		 * @private
		 * @param {Object} positionMatrix Матрица позиций Дорожки
		 * @param {Number} x Позиция колонки
		 * @returns {Boolean} {true}, если колонка не существовала, и {false}, если она уже была в матрице
		 */
		initNewPositionMatrixColumn: function(positionMatrix, x) {
			if (!positionMatrix[x]) {
				positionMatrix[x] = [];
				return true;
			}
			return false;
		},

		/**
		 * Устанавливает Дорожку для Завершающего события на основании предыдущего элемента диаграммы
		 * @private
		 * @param {Object} endEvent Конфиг Завершающего события
		 */
		setEndEventLane: function(endEvent) {
			if (endEvent.incomingFlows.length > 0) {
				endEvent.lane = endEvent.incomingFlows[0].source.lane;
			}
		},

		/**
		 * Выравнивает позицию Завершающего события
		 * @private
		 * @param {Object} diagramConfig Конфиг диаграммы
		 */
		arrangeEndEvent: function(diagramConfig) {
			var endEvent = diagramConfig.endEvent;
			Terrasoft.each(endEvent.incomingFlows, function(flow) {
				if (endEvent.position.x <= flow.source.position.x) {
					endEvent.position.x = flow.source.position.x + 1;
				}
			}, this);
			if (endEvent.position.x === -1 && endEvent.position.y === -1) {
				diagramConfig.endEvent = null;
			}
		},

		/**
		 * Определяет входящий и исходящий порты для каждого потока диаграммы
		 * @private
		 * @param {Object} diagramConfig Конфиг диаграммы
		 */
		arrangePorts: function(diagramConfig) {
			Terrasoft.each(diagramConfig.sequenceFlows, function(flow) {
				var source = flow.source;
				var target = flow.target;
				var deltaY = source.lane.index - target.lane.index;
				if (deltaY === 0) {
					deltaY = source.position.y - target.position.y;
				}
				if (source.position.x > target.position.x) {
					flow.sourcePort = this.PortDirection.Left + (++source.portCount.left);
					if (deltaY > 0) {
						flow.targetPort = this.PortDirection.Down + (++target.portCount.down);
						flow.captionOffsetY = 1;
					} else if (deltaY < 0) {
						flow.targetPort = this.PortDirection.Up + (++target.portCount.up);
					} else {
						flow.targetPort = this.PortDirection.Right + (++target.portCount.right);
					}
					return true;
				}
				if (source.position.x === target.position.x) {
					if (deltaY > 0) {
						flow.sourcePort = this.PortDirection.Up + (++source.portCount.up);
						flow.targetPort = this.PortDirection.Down + (++target.portCount.down);
					} else {
						flow.sourcePort = this.PortDirection.Down + (++source.portCount.down);
						flow.targetPort = this.PortDirection.Up + (++target.portCount.up);
					}
					return true;
				}
				flow.targetPort = this.PortDirection.Left + (++target.portCount.left);
				if (deltaY > 0) {
					flow.sourcePort = this.PortDirection.Up + (++source.portCount.up);
				} else if (deltaY < 0) {
					flow.sourcePort = this.PortDirection.Down + (++source.portCount.down);
					flow.captionOffsetY = 1;
				} else {
					flow.sourcePort = this.PortDirection.Right + (++source.portCount.right);
				}
			}, this);
		},

		/**
		 * Рассчитывает высоту в пикселях Пула и Дорожек на основании информации, созданной при выравнивании диаграммы
		 * @private
		 * @param {Object} diagramConfig Конфиг диаграммы
		 */
		calculateLanesHeight: function(diagramConfig) {
			diagramConfig.laneSet.height = 0;
			Terrasoft.each(diagramConfig.lanes, function(lane) {
				lane.height = this.LANE_HEIGHT * lane.rowCount;
				lane.startY = diagramConfig.laneSet.height;
				lane.offsetY = lane.startY + lane.height / 2;
				diagramConfig.laneSet.height += lane.height + this.LANE_VERTICAL_SPACE;
			}, this);
			diagramConfig.laneSet.height -= this.LANE_VERTICAL_SPACE;
		},

		/**
		 * Поиск в конфиге диаграммы элемента с заданным UId
		 * @private
		 * @param {Object} diagramConfig Конфиг диаграммы
		 * @param {String} elementUid Идентификатор элемента
		 * @returns {Object} Искомый элемент или {null}, если элемент не найден
		 */
		findFlowElementByUid: function(diagramConfig, elementUid) {
			if (diagramConfig.startEvent.uid === elementUid) {
				return diagramConfig.startEvent;
			}
			if (diagramConfig.endEvent.uid === elementUid) {
				return diagramConfig.endEvent;
			}
			for (var i = 0; i < diagramConfig.flowElements.length; i++) {
				if (diagramConfig.flowElements[i].uid === elementUid) {
					return diagramConfig.flowElements[i];
				}
			}
			return null;
		},

		/**
		 * Отрисовка диаграммы процесса
		 * @private
		 * @param {Object} diagramConfig Конфиг элементов диаграммы
		 */
		drawDiagram: function(diagramConfig) {
			var diagram = this.getDiagram();
			diagram.clear();
			if (Ext.isIE) {
				// Syncfusion diagram.clear() в IE10, IE11 не чистит элементы DOM узла htmlLayer
				Ext.select("[class=\"htmlLayer\"] > *").remove();
			}
			diagram.nameTable = {};
			this.resetDiagramSize();
			this.addLaneSet(diagram, diagramConfig.laneSet);
			for (var i = 0; i < diagramConfig.lanes.length; i++) {
				this.addLane(diagram, diagramConfig.lanes[i]);
			}
			this.addStartEvent(diagram, diagramConfig.startEvent);
			for (i = 0; i < diagramConfig.flowElements.length; i++) {
				this.addUserTask(diagram, diagramConfig.flowElements[i]);
			}
			if (diagramConfig.endEvent) {
				this.addEndEvent(diagram, diagramConfig.endEvent);
			}
			for (i = 0; i < diagramConfig.sequenceFlows.length; i++) {
				this.addSequenceFlow(diagram, diagramConfig.sequenceFlows[i]);
			}
			if (Ext.isIE) {
				// По непонятным причинам Syncfusion в IE10, IE11 переворачивает текст на 90 градусов
				var captionLaneSet = Ext.get("LaneSet0_html");
				captionLaneSet.setStyle("transform", "rotate(0deg)");
			}
			this.addLaneContainers(diagram);
			diagram.updateViewPort();
		},

		/**
		 * Создание конфига Пула
		 * @private
		 * @param {Object} item Шаг процесса
		 * @returns {Object} Конфиг Пула
		 */
		createLaneSetConfig: function(item) {
			return {
				"name": item.name,
				"caption": item.caption,
				"height": 0
			};
		},

		/**
		 * Создание конфига Дорожки
		 * @private
		 * @param {Object} item Шаг процесса
		 * @returns {Object} Конфиг Дорожки
		 */
		createLaneConfig: function(item) {
			return {
				"name": item.value,
				"caption": item.displayValue,
				"index": 0,
				"rowCount": 1,
				"positionMatrix": [[false], [false]]
			};
		},

		/**
		 * Создание конфига События
		 * @private
		 * @param {Object} item Шаг процесса
		 * @returns {Object} Конфиг События
		 */
		createEventConfig: function(item) {
			return {
				"uid": item.uid,
				"name": item.name,
				"type": item.column,
				"caption": item.caption,
				"lane": null,
				"position": {"x": -1, "y": -1},
				"incomingFlows": [],
				"outgoingFlows": [],
				"portCount": {
					"up": 0,
					"down": 0,
					"left": 0,
					"right": 0
				}
			};
		},

		/**
		 * Создание конфига Действия
		 * @private
		 * @param {Object} item Шаг процесса
		 * @returns {Object} Конфиг Действия
		 */
		createUserTaskConfig: function(item) {
			return {
				"uid": item.uid,
				"name": item.name,
				"caption": item.caption,
				"type": item.type,
				"nextStep": item.nextStep,
				"conditions": item.conditions,
				"lane": null,
				"position": {"x": -1, "y": -1},
				"incomingFlows": [],
				"outgoingFlows": [],
				"portCount": {
					"up": 0,
					"down": 0,
					"left": 0,
					"right": 0
				}
			};
		},

		/**
		 * Создание конфига Потока управления
		 * @private
		 * @param {Number} sequenceFlowType Тип потока управления
		 * @param {Object} sourceFlowElement Элемент процесса - источник
		 * @param {Object} targetFlowElement Элемент процесса - приемник
		 * @returns {Object} Конфиг Потока управления
		 */
		createSequenceFlowConfig: function(sequenceFlowType, sourceFlowElement, targetFlowElement) {
			var sequenceFlow = {
				"type": sequenceFlowType,
				"source": sourceFlowElement,
				"target": targetFlowElement
			};
			sourceFlowElement.outgoingFlows.push(sequenceFlow);
			targetFlowElement.incomingFlows.push(sequenceFlow);
			return sequenceFlow;
		},

		/**
		 * Функция поиска Дорожки по имени
		 * @private
		 * @param {Array} lanes Массив Дорожек диаграммы
		 * @param {String} laneName Имя искомой Дорожки
		 * @returns {Object} Конфиг искомой Дорожки
		 */
		findLaneConfig: function(lanes, laneName) {
			for (var i = 0; i < lanes.length; i++) {
				if (lanes[i].name === laneName) {
					return lanes[i];
				}
			}
			return null;
		},

		/**
		 * Функция получения представления редактируемого ряда
		 * @private
		 * @returns {Terrasoft.Container} Представление редактируемого ряда
		 */
		getView: function() {
			var view;
			var config = {
				id: "DiagramContainer",
				selectors: {
					wrapEl: "#DiagramContainer"
				},
				classes: {
					wrapClassName: ["diagram-container"]
				},
				items: [],
				afterrender: {
					bindTo: "onViewRendered"
				}
			};
			view = Ext.create("Terrasoft.Container", config);
			return view;
		},

		/**
		 * Функция формирует ссылку на изображение
		 * @private
		 */
		getImageSrc: function(imageId) {
			if (!imageId) {
				return null;
			}
			return Terrasoft.ImageUrlBuilder.getUrl({
				source: Terrasoft.ImageSources.SYS_IMAGE,
				params: {
					primaryColumnValue: imageId
				}
			});
		},

		/**
		 * Обрезает строку заголовка до заданного максимального размера
		 * @private
		 * @param {String} caption Заголовок
		 * @returns {String} Обрезанная строка заголовка, дополненная троеточием
		 */
		cutStringSize: function(caption) {
			return caption.length > this.MAX_LENGTH_CAPTION ?
				caption.substr(0, this.MAX_LENGTH_CAPTION - 4) + "..." : caption;
		},

		/**
		 * Добавляет на диаграмму примитив Пула
		 * @private
		 * @param {Object} diagram DOM-объект диаграммы
		 * @param {Object} config Конфиг добавляемого Пула
		 */
		addLaneSet: function(diagram, config) {
			var renderToSelector = Ext.get(this.renderToSelector);
			renderToSelector.setHeight(config.height + this.SCROLL_HEIGHT);
			diagram.add(this.createLaneSet(config));
		},

		/**
		 * Добавляет на диаграмму примитив Дорожки
		 * @private
		 * @param {Object} diagram DOM-объект диаграммы
		 * @param {Object} config Конфиг добавляемой Дорожки
		 */
		addLane: function(diagram, config) {
			var laneSet = diagram.nameTable.LaneSet0;
			diagram.add(this.createLane(config, laneSet));
			laneSet.children = laneSet.children || [];
			laneSet.children.push(config.name);
		},

		/**
		 * Добавляет на диаграмму примитив Стартового события
		 * @private
		 * @param {Object} diagram DOM-объект диаграммы
		 * @param {Object} config Конфиг Стартового события
		 */
		addStartEvent: function(diagram, config) {
			var lane = diagram.nameTable[config.lane.name];
			diagram.add(this.createStartEvent(config, lane));
		},

		/**
		 * Добавляет на диаграмму примитив Завершающего события
		 * @private
		 * @param {Object} diagram DOM-объект диаграммы
		 * @param {Object} config Конфиг Завершающего события
		 */
		addEndEvent: function(diagram, config) {
			var lane = diagram.nameTable[config.lane.name];
			var eventConfig = this.createTerminateEvent(config, lane);
			if (config.offsetX) {
				eventConfig.offsetX = config.offsetX;
			} else {
				eventConfig.offsetX = eventConfig.offsetX + this.TASK_WIDTH - this.EVENT_SIZE;
			}
			diagram.add(eventConfig);
		},

		/**
		 * Добавляет на диаграмму примитивы контейнеров Дорожек
		 * @private
		 * @param {Object} diagram DOM-объект диаграммы
		 */
		addLaneContainers: function(diagram) {
			var laneContainer = null;
			this.diagramWidth += this.HORIZONTAL_SPACE;
			var canvasWidth = Ext.get(diagram._canvas.id).el.getWidth() - this.LANESET_WIDTH - this.LANE_WIDTH -
				this.LANE_VERTICAL_SPACE;
			this.diagramWidth = Math.max(this.diagramWidth, canvasWidth);
			Terrasoft.each(diagram.model.nodes, function(node) {
				if (node.flowElementType !== "Lane") {
					return;
				}
				diagram.add(this.createLaneContainer(node));
				laneContainer = diagram.nameTable[node.name + "Container"];
				// В спецификации SVG нет z-index, изображение выводится в порядке следования элементов разметки
				// Перемещаем дорожки перед стартовым элементом диаграммы
				diagram._svg.getElementById(node.name).parentNode.insertBefore(
					diagram._svg.getElementById(laneContainer.name), diagram._svg.getElementById("StartElement"));
				this.ej.Diagram.SvgContext.renderSelector(laneContainer, diagram._svg,
					diagram._adornerLayer, diagram._currZoom, diagram.model.selectorConstraints);
			}, this);
			// Увеличиваем размер svg контейнера для отображения скрола Terrasoft вместо Syncfusion
			Ext.get(diagram._canvas.id).setWidth(this.diagramWidth + this.LANESET_WIDTH + this.LANE_WIDTH +
				this.LANE_VERTICAL_SPACE);
		},

		/**
		 * Добавляет на диаграмму примитив Действия
		 * @private
		 * @param {Object} diagram DOM-объект диаграммы
		 * @param {Object} config Конфиг Действия
		 */
		addUserTask: function(diagram, config) {
			var lane = diagram.nameTable[config.lane.name];
			var userTask = this.createUserTask(config, lane);
			diagram.add(userTask);
		},

		/**
		 * Добавляет на диаграмму примитив Потока управления
		 * @private
		 * @param {Object} diagram DOM-объект диаграммы
		 * @param {Object} config Конфиг Потока управления
		 */
		addSequenceFlow: function(diagram, config) {
			var sourceNode = diagram.nameTable[config.source.name];
			var targetNode = diagram.nameTable[config.target.name];
			var flow;
			switch (config.type) {
				case ProcessLibraryConstants.SequenceFlowType.ConditionalFlow:
					flow = this.createConditionalFlow(config, sourceNode, targetNode);
					break;
				case ProcessLibraryConstants.SequenceFlowType.DefaultFlow:
					flow = this.createDefaultFlow(config, sourceNode, targetNode);
					break;
				default:
					flow = this.createSequenceFlow(config, sourceNode, targetNode);
					break;
			}
			diagram.add(flow);
		},

		/**
		 * Возвращает DOM-объект диаграммы
		 * @private
		 * @returns {Object} DOM-объект диаграммы
		 */
		getDiagram: function() {
			return $("#" + this.renderToSelector).ejDiagram("instance");
		},

		/**
		 * Создает примитив Пула
		 * @private
		 * @param {Object} config Конфиг Пула
		 * @returns {Object} Примитив Пула
		 */
		createLaneSet: function(config) {
			return {
				"name": config.name,
				"offsetX": this.LANESET_WIDTH / 2,
				"offsetY": config.height / 2,
				"width": config.height,
				"height": this.LANESET_WIDTH,
				"fillColor": this.LANE_SET_FILL_COLOR,
				"borderWidth": 0,
				"rotateAngle": -90,
				"shape": {
					"type": this.ej.Diagram.Shapes.Html,
					"html": this.Ext.String.format(this.LANE_CAPTION_CONTAINER, config.caption || Ext.emptyString)
				},
				"title": config.caption || Ext.emptyString
			};
		},

		/**
		 * Создает примитив Дорожки
		 * @private
		 * @param {Object} config Конфиг Дорожки
		 * @param {Object} container Примитив Пула, содержащего Дорожку
		 * @returns {Object} Примитив Дорожки
		 */
		createLane: function(config, container) {
			var offsetX = container.offsetX + (container.height / 2) + this.LANE_WIDTH / 2 +
				this.LANE_VERTICAL_SPACE;
			return {
				"name": config.name,
				"flowElementType": "Lane",
				"offsetX": offsetX,
				"offsetY": config.offsetY,
				"startY": config.startY,
				"width": config.height,
				"height": this.LANE_WIDTH,
				"borderWidth": 0,
				"fillColor": this.LANE_FILL_COLOR,
				"rotateAngle": -90,
				"shape": {
					"type": this.ej.Diagram.Shapes.Html,
					"html": this.Ext.String.format(this.LANE_CAPTION_CONTAINER, config.caption || Ext.emptyString)
				},
				"title": config.caption || Ext.emptyString
			};
		},

		/**
		 * Создает примитив контейнера Дорожки
		 * @private
		 * @param {Object} lane Примитив Дорожки, для которой создается контейнер
		 * @returns {Object} Примитив контейнера Дорожки
		 */
		createLaneContainer: function(lane) {
			return {
				"name": lane.name + "Container",
				"offsetX": lane.offsetX + (this.LANESET_WIDTH + this.diagramWidth) / 2,
				"offsetY": lane.offsetY,
				"width": this.diagramWidth - 1,
				"height": lane.width - 1,
				"borderWidth": 1,
				"borderColor": this.LANE_FILL_COLOR,
				"children": [],
				"type": "group",
				"shape": {
					"type": this.ej.Diagram.Shapes.Rectangle
				}
			};
		},

		/**
		 * Создает базовый примитив События
		 * @private
		 * @param {Object} baseShape Конфиг События
		 * @param {Object} additionalIcon Опциональный конфиг внутренней иконки
		 * @returns {Object} Примитив События
		 */
		createBaseEvent: function(baseShape, additionalIcon) {
			var event = {
				"name": baseShape.name,
				"offsetX": (this.TASK_WIDTH + this.HORIZONTAL_SPACE) * (baseShape.position.x + 1),
				"offsetY": baseShape.container.startY + this.LANE_HEIGHT * (baseShape.position.y + 0.5),
				"width": baseShape.diameter,
				"height": baseShape.diameter,
				"borderWidth": baseShape.borderWidth,
				"borderColor": baseShape.borderColor,
				"fillColor": baseShape.fillColor,
				"shape": {
					"type": this.ej.Diagram.Shapes.Ellipse
				}
			};
			if (!this.Ext.isEmpty(baseShape.caption)) {
				event.labels = [
					{
						"text": this.cutStringSize(baseShape.caption),
						"offset": {x: 0.5, y: 1.7},
						"fontSize": this.ELEMENT_FONT_SIZE,
						"fontFamily": this.FONT_FAMILY,
						"fontColor": this.FONT_COLOR,
						"wrapText": true,
						"verticalAlignment": this.ej.datavisualization.Diagram.VerticalAlignment.Top,
						"width": this.CAPTION_WIDTH
					}
				];
			}
			if (this.Ext.isEmpty(additionalIcon)) {
				event.incomingFlowCount = baseShape.incomingFlowCount;
				event.outgoingFlowCount = baseShape.outgoingFlowCount;
				this.addPorts(event, baseShape);
				return event;
			}
			event.parent = baseShape.name;
			event.name = baseShape.name + "_base";
			additionalIcon.parent = baseShape.name;
			var node = {
				"name": baseShape.name,
				"type": "group",
				"children": [event.name, additionalIcon.name],
				"incomingFlowCount": baseShape.incomingFlowCount,
				"outgoingFlowCount": baseShape.outgoingFlowCount
			};
			this.addPorts(node, baseShape);
			return [
				event,
				additionalIcon,
				node
			];
		},

		/**
		 * Создает примитив Стартового события
		 * @private
		 * @param {Object} config Конфиг Стартового события
		 * @param {Object} container Примитив Дорожки, в которой должно находиться создаваемое Событие
		 * @returns {Object} Примитив Стартового события
		 */
		createStartEvent: function(config, container) {
			var event = this.createBaseEvent(
				{
					"name": config.name,
					"container": container,
					"diameter": this.EVENT_SIZE,
					"borderWidth": this.START_EVENT_BORDER_WIDTH,
					"fillColor": this.START_EVENT_FILL_COLOR,
					"borderColor": this.START_EVENT_BORDER_COLOR,
					"caption": config.caption,
					"position": config.position,
					"incomingFlowCount": 0,
					"outgoingFlowCount": config.outgoingFlows.length,
					"portCount": config.portCount
				}
			);
			this.diagramWidth = Math.max(this.diagramWidth, event.offsetX);
			return event;
		},

		/**
		 * Создает примитив Завершающего события
		 * @private
		 * @param {Object} config Конфиг Завершающего события
		 * @param {Object} container Примитив Дорожки, в которой должно находиться создаваемое Событие
		 * @returns {Object} Примитив Завершающего события
		 */
		createTerminateEvent: function(config, container) {
			var additionIcon = {
				"name": config.name + "_additional",
				"offsetX": (this.TASK_WIDTH + this.HORIZONTAL_SPACE) * (config.position.x + 1),
				"offsetY": container.startY + this.LANE_HEIGHT * (config.position.y + 0.5),
				"width": this.EVENT_SIZE - 8,
				"height": this.EVENT_SIZE - 8,
				"borderWidth": this.TERMINATE_EVENT_BORDER_WIDTH,
				"fillColor": this.TERMINATE_EVENT_FILL_COLOR,
				"shape": {
					"type": this.ej.Diagram.Shapes.Ellipse
				}
			};
			var event = this.createBaseEvent(
				{
					"name": config.name,
					"container": container,
					"diameter": this.EVENT_SIZE,
					"borderWidth": this.TERMINATE_EVENT_BASE_BORDER_WIDTH,
					"fillColor": this.TERMINATE_EVENT_BASE_FILL_COLOR,
					"borderColor": this.TERMINATE_EVENT_BASE_BORDER_COLOR,
					"caption": config.caption,
					"position": config.position,
					"incomingFlowCount": config.incomingFlows.length,
					"outgoingFlowCount": 0,
					"portCount": config.portCount
				},
				additionIcon
			);
			this.diagramWidth = Math.max(this.diagramWidth, event[0].offsetX);
			return event;
		},

		/**
		 * Создает примитив Действия
		 * @private
		 * @param {Object} config Конфиг Действия
		 * @param {Object} container Примитив Дорожки, в которой должно находиться создаваемое Действия
		 * @returns {Object} Примитив Действия
		 */
		createUserTask: function(config, container) {
			var name = config.name;
			var caption = config.caption;
			var sysImage = {};
			if (config.type && config.type.SysImage) {
				sysImage = config.type.SysImage;
			}
			var captionOffsetY = 1 + this.CAPTION_MARGIN / this.TASK_HEIGHT;
			var userTask = {
				"name": name + "_base",
				"parent": name,
				"offsetX": (this.TASK_WIDTH + this.HORIZONTAL_SPACE) * (config.position.x + 1),
				"offsetY": container.startY + this.LANE_HEIGHT * (config.position.y + 0.5),
				"width": this.TASK_WIDTH,
				"height": this.TASK_HEIGHT,
				"borderWidth": 0,
				"fillColor": this.TASK_FILL_COLOR,
				"imageId": sysImage.value,
				"shape": {
					"type": this.ej.Diagram.Shapes.Rectangle
				}
			};
			this.diagramWidth = Math.max(this.diagramWidth, userTask.offsetX);
			if (!Ext.isEmpty(caption)) {
				userTask.labels = [
					{
						"text": this.cutStringSize(caption),
						"offset": {x: 0.5, y: captionOffsetY},
						"fontSize": this.ELEMENT_FONT_SIZE,
						"fontFamily": this.FONT_FAMILY,
						"fontColor": this.FONT_COLOR,
						"wrapText": true,
						"verticalAlignment": this.ej.datavisualization.Diagram.VerticalAlignment.Top,
						"width": this.CAPTION_WIDTH
					}
				];
			}
			var userTaskImage = this.createUserTaskImage(userTask);
			var userTaskTypeImage = this.createUserTaskTypeImage(userTask);
			var node = {
				"name": name,
				"type": "group",
				"children": [userTask.name, userTaskImage.name, userTaskTypeImage.name],
				"canUngroup": false,
				"incomingFlowCount": config.incomingFlows.length,
				"outgoingFlowCount": config.outgoingFlows.length
			};
			this.addPorts(node, config);
			return [
				userTask,
				userTaskImage,
				userTaskTypeImage,
				node
			];
		},

		/**
		 * Создает примитив основной иконки Действия
		 * @private
		 * @param {Object} userTask Примитив Действия, для которого создается иконка
		 * @returns {Object} Примитив основной иконки Действия
		 */
		createUserTaskImage: function(userTask) {
			var halfImageSize = this.USER_TASK_IMAGE_SIZE / 2;
			return {
				"name": userTask.name + "_userTaskImage",
				"parent": userTask.name,
				"offsetX": userTask.offsetX - this.TASK_WIDTH / 2 + halfImageSize,
				"offsetY": userTask.offsetY - this.TASK_HEIGHT / 2 + halfImageSize,
				"width": this.USER_TASK_IMAGE_SIZE,
				"height": this.USER_TASK_IMAGE_SIZE,
				"borderWidth": 0,
				"fillColor": this.TASK_FILL_COLOR,
				"shape": {
					"type": this.ej.Diagram.Shapes.Image,
					"src": this.getImageSrc(this.USER_TASK_IMAGE_ID)
				}
			};
		},

		/**
		 * Создает примитив иконки типа Действия
		 * @private
		 * @param {Object} userTask Примитив Действия, для которого создается иконка
		 * @returns {Object} Примитив иконки типа Действия
		 */
		createUserTaskTypeImage: function(userTask) {
			return {
				"name": userTask.name + "_userTaskTypeImage",
				"parent": userTask.name,
				"offsetX": userTask.offsetX,
				"offsetY": userTask.offsetY,
				"width": this.USER_TASK_TYPE_IMAGE_SIZE,
				"height": this.USER_TASK_TYPE_IMAGE_SIZE,
				"borderWidth": 0,
				"fillColor": this.TASK_FILL_COLOR,
				"shape": {
					"type": this.ej.Diagram.Shapes.Image,
					"src":  userTask.imageId ? this.getImageSrc(userTask.imageId) : this.Ext.emptyString
				}
			};
		},

		/**
		 * Создает примитивы портов у узла
		 * @private
		 * @param {Object} node Примитив узла
		 * @param {Object} config Конфиг узла
		 */
		addPorts: function(node, config) {
			node.ports = node.ports || [];
			for (var i = 1; i <= config.portCount.up; i++) {
				node.ports.push(this.createPort(this.PortDirection.Up, i, config.portCount.up));
			}
			for (i = 1; i <= config.portCount.down; i++) {
				node.ports.push(this.createPort(this.PortDirection.Down, i, config.portCount.down));
			}
			for (i = 1; i <= config.portCount.left; i++) {
				node.ports.push(this.createPort(this.PortDirection.Left, i, config.portCount.left));
			}
			for (i = 1; i <= config.portCount.right; i++) {
				node.ports.push(this.createPort(this.PortDirection.Right, i, config.portCount.right));
			}
		},

		/**
		 * Создает порт у узла диаграммы
		 * @private
		 * @param {String} namePrefix Префикс имени порта (определяет сторону узла)
		 * @param {Number} portNumber Номер порта на стороне узла
		 * @param {Number} portCount Общее количество узлов на стороне узла
		 * @returns {Object} Примитив порта
		 */
		createPort: function(namePrefix, portNumber, portCount) {
			var portName = namePrefix + portNumber;
			var delta = 1.0 / (portCount + 1);
			var x;
			var y;
			switch (namePrefix) {
				case this.PortDirection.Up:
					x = delta * portNumber;
					y = 0;
					break;
				case this.PortDirection.Down:
					x = delta * portNumber;
					y = 1;
					break;
				case this.PortDirection.Left:
					x = 0;
					y = delta * portNumber;
					break;
				case this.PortDirection.Right:
					x = 1;
					y = delta * portNumber;
					break;
			}
			return {
				"name": portName,
				"offset": {x: x, y: y},
				"shape": this.ej.Diagram.PortShapes.Circle,
				"visibility": this.ej.Diagram.PortVisibility.Hidden
			};
		},

		/**
		 * Создает примитив Потока управления
		 * @private
		 * @param {Object} config Конфиг Потока управления
		 * @param {Object} sourceNode Примитив элемента-источника
		 * @param {Object} targetNode Примитив элемента-приемника
		 * @returns {Object} Примитив Потока управления
		 */
		createSequenceFlow: function(config, sourceNode, targetNode) {
			var connectorConstraints = this.ej.datavisualization.Diagram.ConnectorConstraints;
			return {
				"name": sourceNode.name + "_" + targetNode.name + "_" + Terrasoft.generateGUID(),
				"constraints": connectorConstraints.Delete | connectorConstraints.Bridging,
				"bridgeSpace": this.CONNECTOR_BRIDGE_SPACE,
				"segments": [{type: this.ej.Diagram.Segments.Orthogonal}],
				"lineColor": this.CONNECTOR_LINE_COLOR,
				"lineWidth": 1,
				"sourceNode": sourceNode.name,
				"sourcePort": config.sourcePort,
				"targetNode": targetNode.name,
				"targetPort": config.targetPort,
				"targetDecorator": {
					shape: this.ej.datavisualization.Diagram.DecoratorShapes.Arrow,
					"width": this.ARROW_WIDTH,
					"height": this.ARROW_HEIGHT,
					"borderColor": this.CONNECTOR_LINE_COLOR,
					"fillColor": this.CONNECTOR_LINE_COLOR
				}
			};
		},

		/**
		 * Создает примитив Условного потока
		 * @private
		 * @param {Object} config Конфиг Потока управления
		 * @param {Object} sourceNode Примитив элемента-источника
		 * @param {Object} targetNode Примитив элемента-приемника
		 * @returns {Object} Примитив Условного потока
		 */
		createConditionalFlow: function(config, sourceNode, targetNode) {
			var captionOffsetY = config.captionOffsetY || 0;
			var flow = this.createSequenceFlow(config, sourceNode, targetNode);
			flow.sourceDecorator = {
				"shape": this.ej.datavisualization.Diagram.DecoratorShapes.Diamond,
				"width": this.DIAMOND_WIDTH,
				"height": this.DIAMOND_HEIGHT,
				"borderColor": this.CONNECTOR_LINE_COLOR,
				"fillColor": this.DIAMOND_FILL_COLOR
			};
			flow.labels = [
				{
					"text": config.caption.join(",\n"),
					"fontSize": this.ELEMENT_FONT_SIZE,
					"fontFamily": this.FONT_FAMILY,
					"fontColor": this.FONT_COLOR,
					"wrapText": true,
					"verticalAlignment": this.ej.datavisualization.Diagram.VerticalAlignment.Top,
					"offset": {x: 0.5, y: captionOffsetY},
					"fillColor": this.CAPTION_BACKCOLOR,
					"width": this.CAPTION_WIDTH
				}
			];
			return flow;
		},

		/**
		 * Создает примитив Потока по умолчанию
		 * @private
		 * @param {Object} config Конфиг Потока управления
		 * @param {Object} sourceNode Примитив элемента-источника
		 * @param {Object} targetNode Примитив элемента-приемника
		 * @returns {Object} Примитив Потока по умолчанию
		 */
		createDefaultFlow: function(config, sourceNode, targetNode) {
			var flow = this.createSequenceFlow(config, sourceNode, targetNode);
			flow.sourceDecorator = {
				shape: this.ej.datavisualization.Diagram.DecoratorShapes.Path,
				"width": this.DIAMOND_WIDTH,
				"height": this.DIAMOND_HEIGHT,
				"borderColor": this.CONNECTOR_LINE_COLOR,
				"pathData": "M0 4L12 4M3 0 L12 8"
			};
			return flow;
		},

		/**
		 * Инициализирует размеры диаграммы
		 * @private
		 */
		resetDiagramSize: function() {
			this.diagramWidth = this.DEF_DIAGRAM_OFFSET_X;
			var renderToSelector = Ext.get(this.renderToSelector);
			renderToSelector.setHeight(this.SCROLL_HEIGHT);
			renderToSelector.setStyle("overflow-x", "auto");
		},

		/**
		 * Создание диаграммы
		 * @private
		 */
		createDiagram: function() {
			// TODO offsetX, offsetY - координаты центра элемента, что не всегда удобно
			// TODO Метод clear диаграммы не очищает контент
			var diagramConstraints = this.ej.Diagram.DiagramConstraints;
			$("#" + this.renderToSelector).ejDiagram({
				"nodes": [],
				"connectors": [],
				"flowElements": [],
				"constraints": diagramConstraints.Default ^ diagramConstraints.Zoomable,
				"snapSettings": {"snapConstraints": this.ej.Diagram.SnapConstraints.None},
				"selectorConstraints": this.ej.Diagram.SelectorConstraints.None,
				"enableVisualGuide": false,
				"enableContextMenu": false,
				"enableAutoScroll": false,
				"width": "100%",
				"height": "100%"
			});
			this.resetDiagramSize();
		},

		/**
		 * Получение модели представления диаграммы
		 * @private
		 */
		getViewModel: function() {
			var scope = this;
			var config = {
				"values": {},
				"columns": {},
				"methods": {
					/**
					 * Обработчик события сгенерированного представления
					 * @private
					 */
					onViewRendered: function() {
						scope.createDiagram();
						var args = scope.sandbox.publish("QuickModelDiagramModuleLoaded", null, [scope.sandbox.id]);
						scope.onUpdateDiagram(args.flowElements);
					}
				}
			};
			return this.Ext.create("Terrasoft.BaseViewModel", config);
		}
	});
	return Terrasoft.QuickModelDiagramModule;
});
