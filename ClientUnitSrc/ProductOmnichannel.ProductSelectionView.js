define("ProductSelectionView", ["ProductSelectionViewResources", "ContainerListEx"],
	function(resources) {

		/**
		 * Получает конфигурацию контейнера
		 * @param id
		 * @param wrapClass
		 * @param items
		 * @returns {Object}
		 */
		function getContainerConfig(id, wrapClass, items, config) {
			var container = {
				className: "Terrasoft.Container",
				id: id,
				markerValue: id + "Container",
				classes: {
					wrapClassName: Ext.isArray(wrapClass) ? wrapClass : [wrapClass]
				},
				selectors: {
					wrapEl: "#" + id
				},
				items: items ? items : []
			};
			if (config) {
				Ext.apply(container, config);
			}
			return container;
		}

		/**
		 * Получает конфигурацию редактируемого реестра
		 * @returns {*}
		 */
		function getGridConfig() {
			return getEditableGridConfig();
		}

		/**
		 * Генерирует ячейку для реестра
		 * @param column Название колонки
		 * @param className Название класса элемента управления
		 * @param columnCount Количество занимаемых колонок
		 * @param advancedConfig Дополнительная конфигурация элемента управления
		 * @returns {Object}
		 */
		function getEditableControlConfig(column, className, columnCount, advancedConfig) {
			var id = ["row", column, className.toLowerCase()].join("-");
			var config = {
				className: "Terrasoft." + className,
				id: id,
				markerValue: id,
				selectors: {wrapEl: "#" + id}
			};
			switch (className) {
				case ("Label") :
					config.caption = {bindTo: column};
					config.classes = {labelClass: ["grid-cols-" + columnCount, "data-label", "gridRow" + column + className]};
					break;
				case ("ImageView") :
					config.tpl = [
						/*jshint white:false */
						"<div id='{id}-wrap-view' class='{wrapClass}'>"+
							"<img id='{id}-image-view' class='image-view-class' src='{imageSrc}' title='{imageTitle}' /></div>"
						/*jshint white:true */
					];
					config.wrapClasses = ["grid-cols-" + columnCount + " " + "gridRow" + column + className];
					break;
				default :
					config.value = {bindTo: column};
					config.classes = {wrapClass: ["grid-cols-" + columnCount, "gridRow" + column + className]};
					break;
			}
			if (advancedConfig) {
				Ext.apply(config, advancedConfig);
			}
			return config;
		}

		/**
		 * Генерирует ячейку строки заголовка для реестра
		 * @param column Название колонки
		 * @param columnCount Количество занимаемых колонок
		 * @param advancedConfig Дополнительная конфигурация элемента управления
		 * @returns {{className: string, id: string, selectors: {wrapEl: string}}}
		 */
		function getCaptionControlConfig(column, columnCount, advancedConfig) {
			var className = "Label";
			var id = ["caption", column, className.toLowerCase()].join("-");
			var config = {
				className: "Terrasoft." + className,
				id: id,
				selectors: {wrapEl: "#" + id},
				markerValue: id
			};
			config.caption = {bindTo: column};
			config.classes = {labelClass: ["grid-cols-" + columnCount, "gridRow" + column + "Caption"]};
			if (advancedConfig) {
				Ext.apply(config, advancedConfig);
			}
			return config;
		}


		/**
		 * Получает конфигурацию редактируемого реестра
		 * @returns {Object}
		 */
		function getEditableGridConfig() {
			var advCodeConfig = {
				hint: {bindTo: "Code"}
			};
			var advUnitConfig = {
				list: {bindTo: "UnitEnumList"},
				prepareList: {bindTo: "fillUnitItems"},
				value: {bindTo: "Unit"}
			};
			var advAvailableInImageConfig = {
				visible: {bindTo: "showImage"},
				imageSrc: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.Warning),
				imageTitle: {bindTo: "AvailableIn"}
			};
			var advAvailableConfig = {
				click: {bindTo: "onAvailableClick"}
			};
			var advPriceConfig = {
				caption: {bindTo: "PriceDisplayValue"}
			};
			var defaultRowConfig = {
				className: "Terrasoft.Container",
				id: "gridRow-container",
				selectors: {wrapEl: "#gridRow-container"},
				classes: {wrapClassName: ["rowContainer", "grid-listed-row", "grid-active-selectable"]},
				items: [
					getEditableControlConfig("Code", "Label", 3, advCodeConfig),
					getEditableControlConfig("Name", "Label", 7),
					getEditableControlConfig("Price", "Label", 4, advPriceConfig),
					getEditableControlConfig("Available", "Label", 2, advAvailableConfig),
					getEditableControlConfig("Count", "FloatEdit", 2),
					getEditableControlConfig("UnitEnumList", "ComboBoxEdit", 3, advUnitConfig),
					getEditableControlConfig("AvailableInImage", "ImageView", 1, advAvailableInImageConfig)
				]
			};
			var editableGridConfig =  {
				className: "Terrasoft.ContainerListEx",
				id: "productsList-container",
				selectors: {wrapEl: "#productsList-container"},
				idProperty: "Id",
				collection: {bindTo: "GridData"},
				classes: {wrapClassName: ["productsList"] },
				defaultItemConfig: defaultRowConfig,
				onGetItemConfig: {bindTo: "onGetItemConfig"},
				observableRowNumber: 3,
				observableRowVisible: {bindTo: "onLoadNext"},
				isAsync: false,
				markerValue: "productsListGrid"
			};
			return editableGridConfig;
		}

		/**
		 * Получает конфигурацию строк заголовка редактируемого реестра
		 * @protected
		 * @returns {Object} - конфигурация контейнера заголовка
		 */
		function getGridCaptionConfig() {
			var containerConfig = {
				className: "Terrasoft.Container",
				id: "gridCaption-container",
				selectors: {wrapEl: "#gridCaption-container"},
				classes: {wrapClassName: ["grid-captions", "gridCaptionContainer"]},
				items: [
					getCaptionControlConfig("CodeLabel", 3),
					getCaptionControlConfig("NameLabel", 7),
					getCaptionControlConfig("PriceLabel", 4),
					getCaptionControlConfig("AvailableLabel", 2),
					getCaptionControlConfig("CountLabel", 2),
					getCaptionControlConfig("UnitLabel", 3)/*,
					getCaptionControlConfig("AvailableInLabel", 1)*/
				]
			};
			return containerConfig;
		}

		/**
		 * Возвращает конфигурацию для элемента управления метки.
		 * @param id Уникальный идентивикатор метки
		 * @param caption Отображаемый текст метки
		 * @param labelClass Css классы
		 * @returns {Object} - конфигурация метки
		 */
		function getLabelConfig(id, caption, labelClass) {
			var config = {
				className: "Terrasoft.Label",
				id: id,
				selectors: { wrapEl: "#" + id },
				caption: caption
			};
			if (!!labelClass) {
				var labelClasses =  Ext.isArray(labelClass) ? labelClass : [labelClass];
				config.classes = {labelClass: labelClasses};
			}
			return config;
		}

		/**
		 * Получает конфигурацию контейнера итогов.
		 * @protected
		 * @returns {Object} - конфигурация контейнера поиска
		 */
		function getSummaryConfig() {
			var ls = resources.localizableStrings;
			var labelClasses = ["summary-label-class"];
			var highlightClasses = ["summary-highlight-label-class"];
			var lineItemsCaptionLabel = getLabelConfig("lineItemsCaptionLabel", ls.LineItemsCaption, labelClasses);
			var lineItemsCountLabel = getLabelConfig("lineItemsCountLabel", {bindTo: "LineItemsCount"}, highlightClasses);
			var totalAmountCaptionLabel = getLabelConfig("totalAmountCaptionLabel", ls.TotalAmountCaption, labelClasses);
			var currencySymbolLabel = getLabelConfig("currencySymbolLabel", {bindTo: "CurrencySymbol"}, highlightClasses);
			var totalAmountLabel = getLabelConfig("totalAmountLabel", {bindTo: "TotalAmount"}, highlightClasses);
			var lineItemsCaptionContainer = getContainerConfig("lineItemsCaptionContainer",
				["lineItemsCaptionContainer-class", "summary-label-container-class"], [lineItemsCaptionLabel]);
			var lineItemsCountContainer = getContainerConfig("lineItemsCountContainer",
				["lineItemsCountContainer-class", "summary-label-container-class"], [lineItemsCountLabel]);
			var totalAmountCaptionContainer = getContainerConfig("totalAmountCaptionContainer",
				["totalAmountCaptionContainer-class", "summary-label-container-class"], [totalAmountCaptionLabel]);
			var currencySymbolContainer = getContainerConfig("currencySymbolContainer",
				["currencySymbolContainer-class", "summary-label-container-class"], [currencySymbolLabel]);
			var totalAmountContainer = getContainerConfig("totalAmountContainer",
				["totalAmountContainer-class", "summary-label-container-class"], [totalAmountLabel]);
			var summaryStringContainer = getContainerConfig("summaryStringContainer",
				"summaryStringContainer-class", [
					lineItemsCaptionContainer,
					lineItemsCountContainer,
					totalAmountCaptionContainer,
					currencySymbolContainer,
					totalAmountContainer
				]);
			return summaryStringContainer;
		}

		/**
		 * Генерирует конфигурацию представления модуля выбора продуктов
		 * @returns {*}
		 */
		function generate() {

			var cancelButton = {
				className: "Terrasoft.Button",
				tag: "CancelButton",
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				visible: true,
				caption: resources.localizableStrings.CancelButtonCaption,
				click: {bindTo: "onCancelButtonClick"}
			};

			var saveButton = {
				className: "Terrasoft.Button",
				tag: "SaveButton",
				style: Terrasoft.controls.ButtonEnums.style.GREEN,
				visible: true,
				caption: resources.localizableStrings.SaveButtonCaption,
				click: {bindTo: "onSaveButtonClick"}
			};

			var actionButtonsContainer = getContainerConfig("actionButtonsContainer",
				["actionButtonsContainer-class", "left-container"], [saveButton, cancelButton]);

			var summaryContainer = getContainerConfig("summaryContainer",
				"summaryContainer-class", [getSummaryConfig()]);

			var searchContainer = getContainerConfig("searchContainer",
				"searchContainer-class", []);

			var utilsContainer = getContainerConfig("utilsContainer",
				["utilsContainer-class", "utilsContainer-width-class"], [actionButtonsContainer, searchContainer, summaryContainer]);

			var gridCaptionContainer = getContainerConfig("gridCaptionContainer",
				"gridCaptionContainer-class", [getGridCaptionConfig()]);

			var gridContainer = getContainerConfig("gridContainer",
				["gridContainer-class", "grid", "grid-listed"], [gridCaptionContainer, getGridConfig()]);

			var rightModulesContainer = getContainerConfig("rightModulesContainer",
				"rightModulesContainer-class", [gridContainer]);

			var filtersContainer = getContainerConfig("filtersContainer",
				"filtersContainer-class", []);

			var foldersContainer = getContainerConfig("foldersContainer",
				"foldersContainer-class", []);

			var leftModulesContainer = getContainerConfig("leftModulesContainer",
				"leftModulesContainer-class", [filtersContainer, foldersContainer]);

			var workingAreaContainer = getContainerConfig("workingAreaContainer",
				"workingAreaContainer-class", [leftModulesContainer, rightModulesContainer]);

			var viewConfig = getContainerConfig("productSelectionContainer",
				"productSelectionContainer-class", [utilsContainer, workingAreaContainer]);

			return viewConfig;
		}
		return {
			generate: generate
		};
	}
);