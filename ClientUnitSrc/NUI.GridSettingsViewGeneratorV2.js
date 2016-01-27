define("GridSettingsViewGeneratorV2", ["ext-base", "terrasoft", "GridSettingsViewGeneratorV2Resources"],
	function(Ext, Terrasoft, resources) {
		/**
		 * Шаблон для конфигурации колонок (Tiled)
		 * @type {Array}
		 */
		var tiledTpl = [
			"<div id='{id}' class='grid'>",
			"<div class='grid-row grid-pad grid-active-selectable' id='columnsSettingsGrid'>",
			"<tpl for='viewCollection'>",
			"<div id='row-{row}' class='grid-row grid-module'>",
			"<tpl if='xindex != xcount'>",
			"<tpl for='cells'>",
			"<tpl if='isNew'>",
			"<div id='element-plus-{parent.row}-{column}' class='grid-cols-{width}'>",
			"<div class='empty-inner-div'>",
			"+",
			"</div>",
			"</div>",
			"<tpl elseif='isEmpty'>",
			"<div id='element-empty-{parent.row}-{column}' class='grid-cols-{width}'>",
			"<div class='empty-inner-div'>",
			"",
			"</div>",
			"</div>",
			"<tpl else>",
			"<div id='element-column-{parent.row}-{column}' class='grid-cols-{width}" +
				"<tpl if='isCurrent'> selected-column<tpl else> unchosen-column</tpl>' data-item-marker='{caption}'>" +
				"<div class='column-inner-div" +
				"<tpl if='isTitleText'> grid-header</tpl>" +
				"<tpl if='isURLType'> column-url</tpl>'>",
			"{caption}",
			"</div>",
			"</div>",
			"</tpl>",
			"</tpl>",
			"<tpl elseif='parent.isTiled || xcount == 1'>",
			"<div id='element-plus-{row}' class='grid-cols-2'>",
			"<div class='empty-inner-div'>",
			"+",
			"</div>",
			"</div>",
			"<tpl for='cells'>",
			"<div id='element-empty-{parent.row}-{column}' class='grid-cols-{width}'> " +
				"<div class='empty-inner-div'>",
			"",
			"</div>",
			"</div>",
			"</tpl>",
			"</tpl>",
			"</div>",
			"</tpl>",
			"</div>",
			"</div>"
		];

		/**
		 * Шаблон для конфигурации колонок (Listed)
		 * @type {Array}
		 */
		var listedTpl =  [
			"<div id='{id}' class='grid'>",
			"<div class='grid-row grid-pad grid-active-selectable' id='columnsSettingsGrid'>",
			"<tpl for='listedViewCollection'>",
			"<div id='row-{row}' class='grid-row grid-module'>",
			"<tpl if='xindex != xcount'>",
			"<tpl for='cells'>",
			"<tpl if='isNew'>",
			"<div id='element-plus-{parent.row}-{column}' class='grid-cols-{width}'>",
			"<div class='empty-inner-div'>",
			"+",
			"</div>",
			"</div>",
			"<tpl elseif='isEmpty'>",
			"<div id='element-empty-{parent.row}-{column}' class='grid-cols-{width}'>",
			"<div class='empty-inner-div'>",
			"",
			"</div>",
			"</div>",
			"<tpl else>",
			"<div id='element-column-{parent.row}-{column}' class='grid-cols-{width}" +
				"<tpl if='isCurrent'> selected-column<tpl else> unchosen-column</tpl>' data-item-marker='{caption}'>" +
				"<div class='column-inner-div" +
				"<tpl if='isTitleText'> grid-header</tpl>" +
				"<tpl if='isURLType'> column-url</tpl>'>",
			"{caption}",
			"</div>",
			"</div>",
			"</tpl>",
			"</tpl>",
			"<tpl elseif='xcount == 1'>",
			"<div id='element-plus-{row}' class='grid-cols-2'>",
			"<div class='empty-inner-div'>",
			"+",
			"</div>",
			"</div>",
			"<tpl for='cells'>",
			"<div id='element-empty-{parent.row}-{column}' class='grid-cols-{width}'> " +
				"<div class='empty-inner-div'>",
			"",
			"</div>",
			"</div>",
			"</tpl>",
			"</tpl>",
			"</div>",
			"</tpl>",
			"</div>",
			"</div>"
		];

		/**
		 * Получает массив конфигураций элементов управления представления модуля настройки колонок
		 * @private
		 * @returns {Array}
		 */
		function getMenuItems() {
			var items = [];
			if (!this.hideButtons) {
				var saveButtonConfig = {
					id: "SaveButton",
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.GREEN,
					caption: resources.localizableStrings.SaveButtonCaption,
					click: {
						bindTo: "saveSettings"
					},
					markerValue: resources.localizableStrings.SaveButtonCaption
				};
				if (this.isSysAdmin && !this.hideAllUsersSaveButton) {
					saveButtonConfig.classes = {wrapperClass: "save-btn-wrapperClass"};
					saveButtonConfig.menu = {
						items: [{
							id: "SaveForAllButton",
							caption: resources.localizableStrings.SaveForAllButtonButtonCaption,
							click: {bindTo: "saveSettingsForAllUsers"},
							markerValue: resources.localizableStrings.SaveForAllButtonButtonCaption
						}]
					};
				} else {
					saveButtonConfig.classes = {textClass: "save-btn-textClass"};
				}
				items.push({
					className: "Terrasoft.Container",
					id: "topSettings",
					selectors: {
						wrapEl: "#topSettings"
					},
					classes: {
						wrapClassName: ["top-settings-container"]
					},
					items: [
						saveButtonConfig,
						{
							id: "CancelButton",
							className: "Terrasoft.Button",
							style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
							caption: resources.localizableStrings.CancelButtonCaption,
							classes: {
								textClass: ["cancel-button-custom"]
							},
							click: {
								bindTo: "cancelSettings"
							}
						}
					]
				});
			}
			if (!this.hideGridType && !this.isCardVisible) {
				items.push(generateTypeSelectConfig());
			}
			items.push({
				className: "Terrasoft.Container",
				id: "columnsSettings",
				selectors: {
					wrapEl: "#columnsSettings"
				},
				classes: {
					wrapClassName: ["columns-settings-container"]
				},
				tpl: (this.gridType === Terrasoft.GridType.LISTED) ? listedTpl : tiledTpl,
				tplData: this
			});
			var buttons = [];

			buttons.push({
					id: "SetupButton",
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.BLUE,
					caption: resources.localizableStrings.SetButtonCaption,
					classes: {
						textClass: ["setup-button"]
					},
					click: {
						bindTo: "setupElement"
					}
				}
			);
			addNarrowExpandOrUpDownButtons(buttons, this);
			buttons.push(
				{
					id: "DeleteButton",
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: resources.localizableStrings.DeleteButtonCaption,
					classes: {
						textClass: ["delete-button"]
					},
					click: {
						bindTo: "deleteElement"
					}
				}
			);
			items.push({
				className: "Terrasoft.Container",
				id: "bottomSettings",
				selectors: {
					wrapEl: "#bottomSettings"
				},
				classes: {
					wrapClassName: ["bottom-settings-container"]
				},
				items: buttons
			});
			return items;
		}

		/**
		 * Добавляет нижние элементы управления колонками
		 * @private
		 * @param {Object[]} buttons
		 * @param {Object} scope
		 */
		function addNarrowExpandOrUpDownButtons(buttons, scope) {
			buttons.push(
				{
					className: "Terrasoft.Label",
					caption: (scope.isCardVisible) ?
						resources.localizableStrings.UpLabelCaption :
						resources.localizableStrings.ExpandLabelCaption,
					classes: {labelClass: ["expand-label-button"]}
				},
				{
					id: "NarrowButton",
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: (scope.isCardVisible) ?
						resources.localizableStrings.UpButtonCaption :
						resources.localizableStrings.NarrowButtonCaption,
					classes: {textClass: ["narrow-button"]},
					markerValue: "decrementWidth",
					click: {
						bindTo: (scope.isCardVisible) ? "moveElementUp" : "narrowElement"
					}
				},
				{
					id: "ExpandButton",
					className: "Terrasoft.Button",
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: (scope.isCardVisible) ?
						resources.localizableStrings.DownButtonCaption  :
						resources.localizableStrings.ExpandButtonCaption,
					classes: {textClass: ["expand-button"]},
					markerValue: "incrementWidth",
					click: {
						bindTo: (scope.isCardVisible) ? "moveElementDown" : "expandElement"
					}
				}
			);
		}

		/**
		 * Генерируетэлементы управления выбора типа реестра
		 * @private
		 * @returns {Object}
		 */
		function generateTypeSelectConfig() {
			return {
				className: "Terrasoft.Container",
				id: "typeSelectContainer",
				markerValue: "ChangeViewMode",
				selectors: {
					wrapEl: "#typeSelectContainer"
				},
				classes: {
					wrapClassName: ["columns-settings-type-select-container"]
				},
				visible: {
					bindTo: "isSingleTypeMode",
					bindConfig: {
						converter: function(value) {
							return !value;
						}
					}
				},
				items: [{
					className: "Terrasoft.Container",
					id: "tiledRadioContainer",
					selectors: {
						wrapEl: "#tiledRadioContainer"
					},
					classes: {
						wrapClassName: ["columns-settings-type-item-container"]
					},
					items: [{
						id: "tiledRadio",
						className: "Terrasoft.RadioButton",
						tag: Terrasoft.GridType.TILED,
						checked: {
							bindTo: "GridType",
							bindConfig: {
								converter: function() {
									return this.get("GridType") === Terrasoft.GridType.TILED;
								}
							}
						}
					}, {
						className: "Terrasoft.Label",
						caption: resources.localizableStrings.TiledCaption,
						inputId: "tiledRadio-el"
					}]
				}, {
					className: "Terrasoft.Container",
					id: "listedRadioContainer",
					selectors: {
						wrapEl: "#listedRadioContainer"
					},
					classes: {
						wrapClassName: ["columns-settings-type-item-container"]
					},
					items: [{
						id: "listedRadio",
						className: "Terrasoft.RadioButton",
						tag: Terrasoft.GridType.LISTED,
						checked: {
							bindTo: "GridType",
							bindConfig: {
								converter: function() {
									return this.get("GridType") === Terrasoft.GridType.LISTED;
								}
							}
						}
					}, {
						className: "Terrasoft.Label",
						caption: resources.localizableStrings.ListedCaption,
						inputId: "listedRadio-el"
					}]
				}]
			};
		}

		/**
		 * Получает конфигурацию представления модуля настройки колонок
		 * @returns {Object}
		 */
		function getViewConfig() {
			var view = {
				className: "Terrasoft.Container",
				id: "gridSettings",
				selectors: {
					wrapEl: "#gridSettings"
				},
				classes: {
					wrapClassName: ["grid-settings"]
				},
				items: getMenuItems.call(this)
			};
			return view;
		}

		return {
			generate: getViewConfig,
			listedTpl: listedTpl,
			tiledTpl: tiledTpl
		};
	});
