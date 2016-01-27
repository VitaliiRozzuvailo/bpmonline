define("PageDesignerUtilities", ["ext-base", "terrasoft",  "PageDesignerUtilitiesResources", "ModalBox", "ColumnHelper",
	"SectionDesignDataModule", "SectionDesignerUtils", "BaseLookup", "MaskHelper", "ConfigurationEnums",
	"css!PageDesignerUtilities"],
	function(Ext, Terrasoft, resources, ModalBox, ColumnHelper, SectionDesignDataModule, SectionDesignerUtils,
			BaseLookup, MaskHelper, ConfigurationEnums) {
		var viewModel;
		var entityColumnType;
		var entityColumnConfig;
		var storage = Terrasoft.DomainCache;
		var localizableStrings = resources.localizableStrings;
		var localizableImages = resources.localizableImages;

		/**
		 * Расчетитывает матрицы элементов в Grid Layout.
		 * @param {Object[]} config.items Элементы Grid Layout.
		 * @returns {Array} matrix Матрица элементов.
		 */
		function getFillingGridMatrix(config)  {
			var matrix = [];
			var items = config.items || config;
			Terrasoft.each(items, function(item) {
				var layout = item.layout;
				if (!layout.rowSpan) {
					layout.rowSpan = 1;
				}
				if (!layout.colSpan) {
					layout.colSpan = 12;
				}
				for (var i = layout.row; i < layout.row + layout.rowSpan; i++) {
					if (!matrix[i]) {
						matrix[i] = new Array(24);
					}
					for (var k = layout.column; k < layout.column + layout.colSpan; k++) {
						matrix[i][k] = true;
					}
				}
			});
			for (var i = 0, ln = matrix.length; i < ln;  i++) {
				if (!matrix[i]) {
					matrix[i] = new Array(24);
				}
			}
			return matrix;
		}

		/**
		 * Получает информацию по деталям.
		 *
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseViewModel} scope Контекст выполнения callback.
		 */
		function getDetailsInfo(callback, scope) {
			var detailsInfo = storage.getItem("SectionDesigner_DetailsInfo");
			if (!detailsInfo) {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SysDetail"
				});
				esq.addColumn("Id");
				esq.addColumn("Caption");
				esq.addColumn("DetailSchemaUId");
				esq.addColumn("EntitySchemaUId");
				esq.addColumn("[VwSysSchemaInWorkspace:UId:DetailSchemaUId].Name", "schemaName");
				esq.addColumn("[VwSysSchemaInWorkspace:UId:DetailSchemaUId].Caption", "schemaCaption");
				esq.addColumn("[VwSysSchemaInWorkspace:UId:EntitySchemaUId].Name", "entitySchemaName");
				esq.addColumn("[VwSysSchemaInWorkspace:UId:EntitySchemaUId].Caption", "entitySchemaCaption");
				esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "[VwSysSchemaInWorkspace:UId:DetailSchemaUId].SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value));
				esq.filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, "[VwSysSchemaInWorkspace:UId:EntitySchemaUId].SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value));
				var collection = Ext.create("Terrasoft.Collection");
				esq.getEntityCollection(function(result) {
					if (result.success) {
						result.collection.each(function(item) {
							collection.add(item.values);
						}, this);
						detailsInfo = collection.getItems();
						storage.setItem("SectionDesigner_DetailsInfo", Terrasoft.encode(detailsInfo));
						callback.call(scope, detailsInfo);
					}
				}, this);
			} else {
				callback.call(scope, Terrasoft.decode(detailsInfo));
			}
		}

		/**
		 * Получает коллекцию обязательных полей которые отсудствуют в схеме.
		 *
		 * @param {Object} schema Схема.
		 * @param {String} typeColumnUId Идентификатор колонки в DesignData.
		 * @returns {Terrasoft.Collection} Коллекция элементов.
		 */
		function getRequireFieldNotInSchema(schema, typeColumnUId) {
			var entityColumns = schema.entitySchema.columns;
			var collection = new Terrasoft.Collection();
			Terrasoft.each(entityColumns, function(column) {
				if (column.isRequired && !column.defaultValue && column.uId !== typeColumnUId) {
					var item = getSchemaItemInfoByName(column.name, schema.viewConfig);
					if (!item) {
						collection.add(column.caption);
					}
				}
			});
			return collection;
		}

		/**
		 * Получает информацию о схеме по ее имени.
		 *
		 * @param {String} name Схема.
		 * @param {Object} parent Родительский элемент.
		 * @returns {Terrasoft.Collection} Коллекция элементов.
		 */
		function getSchemaItemInfoByName(name, parent) {
			var result = null;
			Terrasoft.iterateChildItems(parent, function(iterationConfig) {
				var item = iterationConfig.item;
				if (item.name === name) {
					result = {
						item: item,
						parent: iterationConfig.parent,
						propertyName: iterationConfig.propertyName
					};
				}
				return Ext.isEmpty(result);
			}, this);
			return result;
		}

		/**
		 * Создает элемент заголовка с префиксом.
		 * @private
		 *
		 * @returns {Object}
		 */
		function createPrefixLabel() {
			var prefix = SectionDesignerUtils.getSchemaNamePrefix();
			var visible = (Ext.isEmpty(prefix)) ? false : true;
			var prefixLabel = {
				id: "prefix-label",
				className: "Terrasoft.Label",
				caption: localizableStrings.PrefixMask + " " + prefix,
				visible: visible,
				selectors: {
					wrapEl: "#prefix-label"
				}
			};
			return prefixLabel;
		}

		/**
		 * Создает контейнер.
		 * @private
		 *
		 * @param {Object} config Конфигурационный объект.
		 * @param {String} config.name Имя контейнера.
		 * @param {Array} config.classes Классы контейнера.
		 * @returns {Terrasoft.Container} Сгенерированое представление контейнера.
		 */
		function createContainer(config) {
			var result = Ext.create("Terrasoft.Container", {
				id: config.name,
				selectors: {
					wrapEl: "#" + config.name
				},
				classes: {wrapClassName: config.classes},
				items: []
			});
			return result;
		}

		/**
		 * Создает конфигурационный объект элемента управления TextEdit.
		 * @private
		 *
		 * @param {Object} config
		 * @param {String} config.name Имя элемента управления.
		 * @param {String} config.caption Заголовок элемента управления(слева от элемента).
		 * @param {Boolean} config.enabled Параметр возможности редактриования.
		 * @param {String} config.bindTo Привязка значения элемента управления.
		 * @returns {Object} Конфигурационный объект элемента TextEdit.
		 */
		function createTextEdit(config) {
			var placeholder = (config.placeholder) ? {bindTo: config.placeholder} : "";
			var result = {
				className: "Terrasoft.Container",
				id: config.name + "-container",
				selectors: {wrapEl: "#" + config.name + "-container"},
				classes: {wrapClassName: ["base-element"]},
				items: [
					{
						id: config.name + "Label",
						className: "Terrasoft.Label",
						caption: config.caption,
						selectors: {
							wrapEl: "#" + config.name + "Label"
						},
						isRequired: config.isRequired,
						classes: {labelClass: ["base-element-left"]}
					}, {
						className: "Terrasoft.TextEdit",
						id: config.name + "TextEdit",
						value: {
							bindTo: config.bindTo || config.name
						},
						selectors: {
							wrapEl: "#" + config.name + "TextEdit"
						},
						markerValue: config.name,
						placeholder: placeholder,
						enabled: config.enabled,
						classes: {wrapClass: ["base-element-right"]}
					}
				]
			};
			return result;
		}

		/**
		 * Создает конфигурационный объект элемента управления RadioButton.
		 * @private
		 *
		 * @param {Object} config.
		 * @param {String} config.name Имя элемента управления.
		 * @param {String} config.caption Заголовок элемента управления.
		 * @param {Boolean} config.checked Признак включения(отключения) элемента управления.
		 * @param {Array} config.items Элементы которые будут добавлены в контейнер под элементом управления.
		 * @returns {Object} Конфигурационный объект элемента RadioButton.
		 */
		function createRadioButton(config) {
			var result = {
				className: "Terrasoft.Container",
				id: config.name + "Container",
				selectors: {wrapEl: "#" + config.name + "Container"},
				classes: {wrapClassName: ["base-element"]},
				items: [
					{
						id: config.name + "RadioButton",
						className: "Terrasoft.RadioButton",
						enabled: config.enabled,
						checked: {bindTo: config.checked},
						tag: config.tag,
						selectors: {wrapEl: "#" + config.name + "RadioButton"}
					}, {
						id: config.name + "Label",
						className: "Terrasoft.Label",
						caption: config.caption,
						selectors: {wrapEl: "#" + config.name + "Label"},
						classes: {labelClass: ["radio-button-label"]}
					}, {
						className: "Terrasoft.Container",
						id: config.name + "ContentContainer",
						selectors: {wrapEl: "#" + config.name  + "ContentContainer"},
						items: config.items,
						visible: {bindTo: config.containerVisible},
						markerValue: config.name,
						classes: {wrapClassName: ["radio-button-container"]}
					}
				]
			};
			return result;
		}

		/**
		 * Создает конфигурационный объект элемента управления CheckBox.
		 * @private
		 *
		 * @param {Object} config.
		 * @param {String} config.name Имя элемента управления.
		 * @param {String} config.caption Заголовок элемента управления.
		 * @returns {Object} Конфигурационный объект элемента CheckBox.
		 */
		function createCheckBox(config) {
			var result = {
				className: "Terrasoft.Container",
				id: config.name + "Container",
				selectors: {wrapEl: "#" + config.name + "Container"},
				classes: {wrapClassName: ["base-element"]},
				items: [
					{
						id: config.name + "Label",
						className: "Terrasoft.Label",
						caption: config.caption,
						selectors: {wrapEl: "#" + config.name + "Label"},
						classes: {labelClass: ["check-box-left"]}
					}, {
						className: "Terrasoft.CheckBoxEdit",
						id: config.name + "CheckBoxEdit",
						selectors: {wrapEl: "#" + config.name + "CheckBoxEdit"},
						markerValue: config.name,
						checked: {bindTo: config.name}
					}
				]
			};
			return result;
		}

		/**
		 * Создает конфигурационный объект элемента управления ComboBox.
		 * @private
		 *
		 * @param {Object} config.
		 * @param {String} config.name Имя элемента управления.
		 * @param {String} config.caption Заголовок элемента управления.
		 * @param {Boolean} config.enabled Параметр возможности редактриования.
		 * @param {String} config.list Параметр списка для элемента управления.
		 * @param {Function} config.prepareList Функция загрузки списка для элемента управлени.
		 * @returns {Object} Конфигурационный объект элемента ComboBox.
		 */
		function createComboBox(config) {
			var result = {
				className: "Terrasoft.Container",
				id: config.name + "Container",
				selectors: {wrapEl: "#" + config.name + "Container"},
				classes: {wrapClassName: ["base-element"]},
				items: [
					{
						id: config.name + "Label",
						className: "Terrasoft.Label",
						caption: config.caption,
						selectors: {wrapEl: "#" + config.name + "Label"},
						isRequired: config.isRequired,
						classes: {labelClass: ["base-element-left"]}
					}, {
						className: "Terrasoft.ComboBoxEdit",
						id: config.name + "ComboBoxEdit",
						enabled: config.enabled,
						selectors: {wrapEl: "#" + config.name + "ComboBoxEdit"},
						classes: {wrapClass: ["base-element-right"]},
						value: {bindTo: config.name},
						list: {bindTo: config.list},
						markerValue: config.name,
						prepareList: {bindTo: config.prepareList}
					}
				]
			};
			return result;
		}

		/**
		 * Созданет элемент управления группы компонентов.
		 * @private
		 * @param {String} name Имя элемента управления.
		 * @param {Array} classes Классы группы.
		 * @param {Array} items Элементы в этой группе.
		 * @returns {Terrasoft.ControlGroup} Возвращает сгенерированое представление группы компонентов.
		 */
		function createControlGroup(name, classes, items) {
			var result = Ext.create("Terrasoft.ControlGroup", {
				id: name + "ControlGroup",
				selectors: {wrapEl: "#" + name + "ControlGroup"},
				collapsed: false,
				caption: localizableStrings.StyleCaption,
				bottomLine: false,
				items: items
			});
			if (Ext.isArray(classes)) {
				result.classes = {
					wrapClassName: classes
				};
			}
			return result;
		}

		/**
		 * Создает шапку для модального окна (шапка содержит заголовок окна и кнопки сохранения и отмены).
		 * @private
		 *
		 * @returns {Terrasoft.Container} Сгенерированое представление шапки модального окна.
		 */
		function createHeaderContainer() {
			var headerContainer = createContainer({name: "captionContainer"});
			headerContainer.add([{
				className: "Terrasoft.Label",
				id: "caption-label",
				selectors: {wrapEl: "#caption-label"},
				caption: {bindTo: "headerCaption"}
			}, {
				className: "Terrasoft.Button",
				id: "closeButton",
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
				imageConfig: localizableImages.CloseIcon,
				classes: {wrapperClass: ["closeIcon"]},
				selectors: {wrapEl: "#closeButton"},
				click: {bindTo: "onCancelClick"}
			}, {
				id: "saveButton",
				className: "Terrasoft.Button",
				caption: localizableStrings.SaveButtonCaption,
				style: Terrasoft.controls.ButtonEnums.style.GREEN,
				tag: "saveButton",
				selectors: {wrapEl: "#saveButton"},
				click: {bindTo: "onSaveClick"}
			}, {
				className: "Terrasoft.Button",
				id: "cancelButton",
				selectors: {wrapEl: "#cancelButton"},
				caption: localizableStrings.CancelButtonCaption,
				tag: "cancelButton",
				click: {bindTo: "onCancelClick"}
			}]);
			return headerContainer;
		}

		/**
		 * Создает главное представления модального окна.
		 * @private
		 *
		 * @returns {Terrasoft.Container} Возвращает сгенерированое представление.
		 */
		function createMainView() {
			var content = [];
			var mainContainer = createContainer({name: "mainContainer"});
			var headerContainer = createHeaderContainer();
			content.push(headerContainer);
			mainContainer.add(content);
			return mainContainer;
		}

		/**
		 * Создает представление модального окна для типа "Справочник".
		 * @private
		 *
		 * @returns {Terrasoft.Container} Сгенерированое представление модального окна для типа "Справочник".
		 */
		function createLookupView() {
			var checkBoxContainer = createContainer({
				name: "contentContainer",
				classes: ["top-container-margin"]
			});
			checkBoxContainer.add([
				createCheckBox({
					name: "isListView",
					caption: localizableStrings.UseListViewCaption
				}),
				createCheckBox({
					name: "require",
					caption: localizableStrings.IsRequiredCaption
				}),
				createCheckBox({
					name: "readOnly",
					caption: localizableStrings.IsReadOnlyCaption
				})
			]);
			var controlGroupItems = {
				className: "Terrasoft.Container",
				id: "styleControlGroupContainer",
				selectors: {
					wrapEl: "#styleControlGroupContainer"
				},
				items: [
					createCheckBox({
						name: "hideCaption",
						caption: localizableStrings.HideLookupCaptionLabel
					}),
					createComboBox({
						name: "textSize",
						caption: localizableStrings.TextSizeLabel,
						list: "textSizeList",
						prepareList: "prepareTextSize",
						enabled: true
					})
				]
			};
			var view = createContainer({name: "contentContainer"});
			view.add([
				createTextEdit({
					name: "columnCaption",
					placeholder: "columnCaptionPlaceholder",
					isRequired: true,
					caption: localizableStrings.TitleCaption,
					enabled: true
				}),
				createTextEdit({
					name: "columnName",
					bindTo: "columnName",
					enabled: {bindTo: "isEditMode"},
					isRequired: true,
					caption: localizableStrings.NameCaption
				}),
				createPrefixLabel(),
				createRadioButton({
					name: "existLookup",
					caption: localizableStrings.LookupExistedCaption,
					checked: "isNewLookup",
					containerVisible: "isExistLookup",
					tag: false,
					enabled: {bindTo: "isEditMode"},
					items: [createComboBox({
						name: "lookup",
						list: "lookupList",
						prepareList: "prepareLookupList",
						isRequired: true,
						caption: getCaptionByDataValueType(Terrasoft.DataValueType.LOOKUP),
						enabled: {bindTo: "isEditMode"}
					})]
				}),
				createRadioButton({
					name: "newLookup",
					caption: localizableStrings.LookupNewCaption,
					checked: "isNewLookup",
					containerVisible: "isNewLookup",
					tag: true,
					enabled: {bindTo: "isEditMode"},
					items: [createTextEdit({
						name: "lookupCaption",
						caption: localizableStrings.TitleCaption,
						isRequired: true,
						enabled: true
					}),
					createTextEdit({
						name: "lookupName",
						caption: localizableStrings.NameCaption,
						isRequired: true,
						enabled: true
					})]
				}),
				checkBoxContainer,
				createControlGroup("style", ["control-group-container"], controlGroupItems)
			]);
			return view;
		}

		/**
		 * Создает представление модального окна для типа "Строка".
		 * @private
		 *
		 * @returns {Terrasoft.Container} Сгенерированое представление модального окна для типа "Строка".
		 */
		function createTextView() {
			var checkBoxContainer = createContainer({
				name: "contentContainer",
				classes: ["top-container-margin"]
			});
			var controlGroupItems = {
				className: "Terrasoft.Container",
				id: "styleControlGroupContainer",
				selectors: {
					wrapEl: "#styleControlGroupContainer"
				},
				items: [
					createCheckBox({
						name: "hideCaption",
						caption: localizableStrings.HideLookupCaptionLabel
					}),
					createComboBox({
						name: "textSize",
						caption: localizableStrings.TextSizeLabel,
						list: "textSizeList",
						prepareList: "prepareTextSize",
						enabled: true
					})
				]
			};
			checkBoxContainer.add([
				createCheckBox({
					name: "multiLine",
					caption: localizableStrings.IsMultilineCaption
				}),
				createCheckBox({
					name: "require",
					caption: localizableStrings.IsRequiredCaption
				}),
				createCheckBox({
					name: "readOnly",
					caption: localizableStrings.IsReadOnlyCaption
				})
			]);
			var view = createContainer({name: "contentContainer"});
			view.add([
				createTextEdit({
					name: "columnCaption",
					placeholder: "columnCaptionPlaceholder",
					enabled: true,
					isRequired: true,
					caption: localizableStrings.TitleCaption
				}),
				createTextEdit({
					name: "columnName",
					enabled: {bindTo: "isEditMode"},
					bindTo: "columnName",
					isRequired: true,
					caption: localizableStrings.NameCaption
				}),
				createPrefixLabel(),
				createComboBox({
					name: "lineSize",
					list: "lineSizeList",
					prepareList: "prepareLineSize",
					caption: localizableStrings.StringLengthCaption,
					enabled: {bindTo: "isEditMode"}
				}),
				checkBoxContainer,
				createControlGroup("style", ["control-group-container"], controlGroupItems)
			]);
			return view;
		}

		/**
		 * Создает представление модального окна для типа "Целое число".
		 * @private
		 *
		 * @returns {Terrasoft.Container} view Сгенерированое представление модального окна для типа типа "Целое число".
		 */
		function createIntegerView() {
			var checkBoxContainer = createContainer({
				name: "checkBoxContainer",
				classes: ["top-container-margin"]
			});
			var controlGroupItems = {
				className: "Terrasoft.Container",
				id: "styleControlGroupContainer",
				selectors: {
					wrapEl: "#styleControlGroupContainer"
				},
				items: [
					createCheckBox({
						name: "hideCaption",
						caption: localizableStrings.HideLookupCaptionLabel
					}),
					createComboBox({
						name: "textSize",
						caption: localizableStrings.TextSizeLabel,
						list: "textSizeList",
						prepareList: "prepareTextSize",
						enabled: true
					})
				]
			};
			checkBoxContainer.add([
				createCheckBox({
					name: "require",
					caption: localizableStrings.IsRequiredCaption
				}),
				createCheckBox({
					name: "readOnly",
					caption: localizableStrings.IsReadOnlyCaption
				})
			]);
			var view = createContainer({name: "contentContainer"});
			view.add([
				createTextEdit({
					name: "columnCaption",
					placeholder: "columnCaptionPlaceholder",
					enabled: true,
					isRequired: true,
					caption: localizableStrings.TitleCaption
				}),
				createTextEdit({
					name: "columnName",
					enabled: {bindTo: "isEditMode"},
					bindTo: "columnName",
					isRequired: true,
					caption: localizableStrings.NameCaption
				}),
				createPrefixLabel(),
				checkBoxContainer,
				createControlGroup("style", ["control-group-container"], controlGroupItems)
			]);
			return view;
		}

		/**
		 * Создает представление модального окна для типа "Дробное число".
		 * @private
		 *
		 * @returns {Terrasoft.Container} Сгенерированое представление модального окна для типа "Дробное число".
		 */
		function createFloatView() {
			var checkBoxContainer = createContainer({
				name: "checkBoxContainer",
				classes: ["top-container-margin"]
			});
			checkBoxContainer.add([
				createCheckBox({
					name: "require",
					caption: localizableStrings.IsRequiredCaption
				}),
				createCheckBox({
					name: "readOnly",
					caption: localizableStrings.IsReadOnlyCaption
				})
			]);
			var controlGroupItems = {
				className: "Terrasoft.Container",
				id: "styleControlGroupContainer",
				selectors: {
					wrapEl: "#styleControlGroupContainer"
				},
				items: [
					createCheckBox({
						name: "hideCaption",
						caption: localizableStrings.HideLookupCaptionLabel
					}),
					createComboBox({
						name: "textSize",
						caption: localizableStrings.TextSizeLabel,
						list: "textSizeList",
						prepareList: "prepareTextSize",
						enabled: true
					})
				]
			};
			var view = createContainer({name: "contentContainer"});
			view.add([
				createTextEdit({
					name: "columnCaption",
					placeholder: "columnCaptionPlaceholder",
					enabled: true,
					isRequired: true,
					caption: localizableStrings.TitleCaption
				}),
				createTextEdit({
					name: "columnName",
					enabled: {bindTo: "isEditMode"},
					bindTo: "columnName",
					isRequired: true,
					caption: localizableStrings.NameCaption
				}),
				createPrefixLabel(),
				createComboBox({
					name: "precision",
					list: "precisionList",
					prepareList: "preparePrecision",
					caption: localizableStrings.FloatTypeCaption,
					enabled: {bindTo: "isEditMode"}
				}),
				checkBoxContainer,
				createControlGroup("style", ["control-group-container"], controlGroupItems)
			]);
			return view;
		}

		/**
		 * Создает представление модального окна для типа "Дата".
		 * @private
		 *
		 * @returns {Terrasoft.Container} Сгенерированое представление модального окна для типа "Дата".
		 */
		function createDateView() {
			var checkBoxContainer = createContainer({
				name: "checkBoxContainer",
				classes: ["top-container-margin"]
			});
			checkBoxContainer.add([
				createCheckBox({
					name: "require",
					caption: localizableStrings.IsRequiredCaption
				}),
				createCheckBox({
					name: "readOnly",
					caption: localizableStrings.IsReadOnlyCaption
				})
			]);
			var controlGroupItems = {
				className: "Terrasoft.Container",
				id: "styleControlGroupContainer",
				selectors: {
					wrapEl: "#styleControlGroupContainer"
				},
				items: [
					createCheckBox({
						name: "hideCaption",
						caption: localizableStrings.HideLookupCaptionLabel
					}),
					createComboBox({
						name: "textSize",
						caption: localizableStrings.TextSizeLabel,
						list: "textSizeList",
						prepareList: "prepareTextSize",
						enabled: true
					})
				]
			};
			var view = createContainer({name: "contentContainer"});
			view.add([
				createTextEdit({
					name: "columnCaption",
					placeholder: "columnCaptionPlaceholder",
					enabled: true,
					isRequired: true,
					caption: localizableStrings.TitleCaption
				}),
				createTextEdit({
					name: "columnName",
					enabled: {bindTo: "isEditMode"},
					bindTo: "columnName",
					isRequired: true,
					caption: localizableStrings.NameCaption
				}),
				createPrefixLabel(),
				createComboBox({
					name: "format",
					list: "formatList",
					prepareList: "prepareFormatList",
					caption: localizableStrings.DateTypeCaption,
					enabled: {bindTo: "isEditMode"}
				}),
				checkBoxContainer,
				createControlGroup("style", ["control-group-container"], controlGroupItems)
			]);
			return view;
		}

		/**
		 * Создает представление модального окна для типа "Логическое".
		 * @private
		 *
		 * @returns {Terrasoft.Container} Сгенерированое представление модального окна для типа "Логическое".
		 */
		function createBoolView() {
			var checkBoxContainer = createContainer({
				name: "contentContainer",
				classes: ["top-container-margin"]
			});
			checkBoxContainer.add([
				createCheckBox({
					name: "readOnly",
					caption: localizableStrings.IsReadOnlyCaption
				})
			]);
			var controlGroupItems = {
				className: "Terrasoft.Container",
				id: "styleControlGroupContainer",
				selectors: {
					wrapEl: "#styleControlGroupContainer"
				},
				items: [
					createCheckBox({
						name: "hideCaption",
						caption: localizableStrings.HideLookupCaptionLabel
					}),
					createComboBox({
						name: "textSize",
						caption: localizableStrings.TextSizeLabel,
						list: "textSizeList",
						prepareList: "prepareTextSize",
						enabled: true
					})
				]
			};
			var view = createContainer({name: "contentContainer"});
			view.add([
				createTextEdit({
					name: "columnCaption",
					placeholder: "columnCaptionPlaceholder",
					enabled: true,
					isRequired: true,
					caption: localizableStrings.TitleCaption
				}),
				createTextEdit({
					name: "columnName",
					enabled: {bindTo: "isEditMode"},
					bindTo: "columnName",
					isRequired: true,
					caption: localizableStrings.NameCaption
				}),
				checkBoxContainer,
				createPrefixLabel(),
				createControlGroup("style", ["control-group-container"], controlGroupItems)
			]);
			return view;
		}

		/**
		 * Создает представление модального окна для выбора существующей колонки.
		 * @private
		 *
		 * @returns {Terrasoft.Container} Сгенерированое представление модального окна для выбора существующей колонки.
		 */
		function createExistingColumnView() {
			var view = createContainer({name: "contentContainer"});
			view.add([
				{
					id: "objectNameLabel",
					className: "Terrasoft.Label",
					selectors: {wrapEl: "#objectNameLabel"},
					caption: {bindTo: "objectName"}
				}, {
					id: "column",
					className: "Terrasoft.Label",
					caption: localizableStrings.Column,
					selectors: {wrapEl: "#column"}
				}, {
					className: "Terrasoft.ComboBoxEdit",
					id: "columns",
					selectors: {wrapEl: "#columns"},
					value: {bindTo: "existColumnName"},
					list: {bindTo: "columnList"},
					prepareList: {bindTo: "prepareColumnList"},
					markerValue: "columnName"
				}
			]);
			return view;
		}

		var existingColumnCallback;
		var existingColumnScope;

		/**
		 * Создает модальное окно для выбора существующей колонки.
		 *
		 * @param {Object} schema Схема.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Terrasoft.BaseViewModel} scope Модель представления дизайнера.
		 */
		function showExistingColumnWindow(schema, callback, scope) {
			existingColumnCallback = callback;
			existingColumnScope = scope;
			var container = ModalBox.show({
				widthPixels: "550px",
				heightPixels: "670px"
			});
			var view = createMainView();
			view.add(createExistingColumnView());
			ModalBox.setSize(550, 250);
			viewModel = generateExistingColumnViewModel(schema);
			viewModel.set("schema", schema);
			viewModel.set("pvm", this);
			viewModel.set("objectName", schema.entitySchemaName);
			view.bind(viewModel);
			view.render(container);
		}

		/**
		 * Создает модель представления окна для выбора существующей колонки.
		 * @private
		 *
		 * @returns {Terrasoft.BaseViewModel} Сгенерированная  модель представления.
		 */
		function generateExistingColumnViewModel() {
			var viewModelConfig = {
				columns: {
					schema: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					headerCaption: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					existColumnName: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						isRequired: true
					},
					objectName: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					columnList: {
						dataValueType: Terrasoft.DataValueType.ENUM,
						isCollection: true
					}
				},
				values: {
					columnList: new Terrasoft.Collection(),
					schema: null,
					headerCaption: localizableStrings.SelectColumn
				},
				methods: {
					onSaveClick: existingColumnSave,
					onCancelClick: onCancelClick,
					prepareColumnList: prepareColumnList
				}
			};
			viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
			return viewModel;
		}

		/**
		 * Функция сохранения вобраной существующей колонки.
		 */
		function existingColumnSave() {
			var columnName = this.get("existColumnName");
			existingColumnCallback.call(existingColumnScope, columnName);
			ModalBox.close();
		}

		/**
		 * Функция создания модального окна для создания новой колонки.
		 * @param {Terrasoft.DataValueType} config.dataValueType - Тип поля.
		 * @param {Terrasoft.BaseEntitySchema} config.entitySchema - Схема сущности.
		 * @param {Object} config.column - колонка.
		 */
		function showNewColumnWindow(config) {
			entityColumnConfig = config;
			var container = ModalBox.show({
				widthPixels: "550px",
				heightPixels: "670px"
			});
			var view = createMainView();
			var type = parseInt(config.dataValueType, 10);
			switch (type) {
				case Terrasoft.DataValueType.TEXT:
					view.add(createTextView());
					ModalBox.setSize(550, 575);
					break;
				case Terrasoft.DataValueType.INTEGER:
					view.add(createIntegerView());
					ModalBox.setSize(550, 495);
					break;
				case Terrasoft.DataValueType.FLOAT:
				case Terrasoft.DataValueType.MONEY:
					view.add(createFloatView());
					ModalBox.setSize(550, 545);
					break;
				case Terrasoft.DataValueType.DATE:
				case Terrasoft.DataValueType.TIME:
				case Terrasoft.DataValueType.DATE_TIME:
					view.add(createDateView());
					ModalBox.setSize(550, 545);
					break;
				case Terrasoft.DataValueType.LOOKUP:
					view.add(createLookupView());
					ModalBox.setSize(550, 735);
					break;
				case Terrasoft.DataValueType.BOOLEAN:
					view.add(createBoolView());
					ModalBox.setSize(550, 455);
					break;
				default:
					view.add(createBoolView());
					ModalBox.setSize(550, 455);
					break;
			}
			viewModel = createNewColumnViewModel(config.entitySchema, type, config.schema);
			viewModel.set("entityColumn", config.column);
			viewModel.set("readOnly", config.readOnly);
			entityColumnType = ColumnHelper.GetTypeByDataValueType(config.column.dataValueType);
			if (!config.isNew) {
				setViewModelValues(config, viewModel);
				viewModel.set("headerCaption", localizableStrings.Column);
			} else {
				var textSize = {
					value: 2,
					displayValue: localizableStrings.DefaultCaption
				};
				var dateFormat = {
					value: "DateTime",
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.DATE_TIME)
				};
				viewModel.set("textSize", textSize);
				viewModel.set("format", dateFormat);
				viewModel.set("headerCaption", localizableStrings.NewColumnWindowHeaderCaption);
			}
			subscribeEvents();
			view.bind(viewModel);
			view.render(container);
		}

		/**
		 * Функция создания модели представления окна для добавления новой колонки.
		 * @param {Object} entitySchema Схема сущности.
		 * @param {Terrasoft.DataValueType} type Тип данных колонки.
		 * @param {Object} schema Схема страницы.
		 * @returns Возвращает сгенерированую модель представления.
		 */
		function createNewColumnViewModel(entitySchema, type, schema) {
			var viewModelConfig = {
				entitySchema: entitySchema,
				columns: {
					entityColumn: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					columnCaption: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					},
					columnCaptionPlaceholder: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: false
					},
					columnName: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					},
					hideCaption: {
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					},
					textSizeList: {
						dataValueType: Terrasoft.DataValueType.ENUM,
						isCollection: true
					},
					textSize: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						dataValueType: Terrasoft.DataValueType.LOOKUP
					},
					require: {
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					},
					readOnly: {
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					},
					headerCaption: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					isEditMode: {
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					}
				},
				values: {
					entityColumn: null,
					columnCaption: null,
					columnCaptionPlaceholder: null,
					columnName: null,
					hideCaption: false,
					textSizeList: new Terrasoft.Collection(),
					textSize: null,
					require: false,
					headerCaption: false,
					isEditMode: true,
					lineSizeList: new Terrasoft.Collection(),
					lineSize: null,
					multiLine: false,
					precisionList: new Terrasoft.Collection(),
					precision: null,
					formatList: new Terrasoft.Collection(),
					format: null,
					isNewLookup: false,
					isExistLookup: true,
					lookup: null,
					lookupList: new Terrasoft.Collection(),
					lookupCaption: null,
					lookupName: null,
					isListView: false,
					isFireEvent: false
				},
				validationConfig: {
					columnName: [
						function(value) {
							var isEditMode = this.get("isEditMode");
							if (!isEditMode) {
								return {
									invalidMessage: ""
								};
							}
							var result = SectionDesignerUtils.validateSystemName(value, {
								maxLength: 30
							});
							if (!result.isValid) {
								return {
									invalidMessage: result.invalidMessage
								};
							}
							var prefix = SectionDesignerUtils.getSchemaNamePrefix();
							if (prefix) {
								if (!SectionDesignerUtils.validateNamePrefix(value)) {
									value = prefix + value;
								}
							}
							var schemaItem = getSchemaItemInfoByName(value, schema.viewConfig);
							var columns = this.entitySchema.columns;
							var duplicateInList = false;
							Terrasoft.each(columns, function(item, key) {
								if (key === value) {
									duplicateInList = true;
								}
							}, this);
							var invalidMessage = (!schemaItem && !duplicateInList)
								? {invalidMessage: ""}
								: {invalidMessage: localizableStrings.DuplicatedItemNameMessage};
							return invalidMessage;

						}
					]
				},
				methods: {
					onSaveClick: onSaveClick,
					onCancelClick: onCancelClick,
					prepareTextSize: prepareTextSize,
					setViewModelValues: setViewModelValues,
					prepareLineSize: prepareLineSize,
					preparePrecision: preparePrecision,
					prepareFormatList: prepareFormatList,
					subscribeEvents: subscribeEvents,
					prepareLookupList: prepareLookupList
				}
			};
			var config = getViewModelConfigByDataValueType(type);
			Ext.apply(viewModelConfig.columns, config.columns);
			if (!viewModelConfig.validationConfig) {
				viewModelConfig.validationConfig = config.validationConfig;
			} else {
				Ext.apply(viewModelConfig.validationConfig, config.validationConfig);
			}
			viewModel = Ext.create("Terrasoft.BaseViewModel", viewModelConfig);
			return viewModel;
		}

		/**
		 * Устанавливает строку с типами данных в кеш.
		 * @private
		 */
		function setDataValueTypesStorage() {
			var cachedConfig = storage.getItem("SectionDesigner_DataValueTypes");
			if (!cachedConfig) {
				SectionDesignerUtils.postServiceRequest({
					methodName: "GetDataValueTypes",
					callback: function(request, success, response) {
						if (success) {
							var typesConfig =
								Terrasoft.decode(response.responseText).GetDataValueTypesResult.DataValueTypeInfoList;
							storage.setItem("SectionDesigner_DataValueTypes", Terrasoft.encode(typesConfig));
						}
					}
				});
			}
		}

		/**
		 * Получает заголовок по типу или подтипу.
		 * @private
		 * @param {Terrasoft.DataValueType} dataValueType Значение типа.
		 * @param {Number} subTypeValue Значение атрибута подтипа (Size или Precision).
		 * @return {String} Заголовок типа или подтипа.
		 */
		function getCaptionByDataValueType(dataValueType, subTypeValue) {
			var typesConfig = Terrasoft.decode(storage.getItem("SectionDesigner_DataValueTypes"));
			if (!typesConfig) {
				return null;
			}
			var typeItem = getItemByAttribute(typesConfig, dataValueType, "DataValueType");
			if (!typeItem) {
				return null;
			}
			if (!subTypeValue) {
				return typeItem.Caption;
			}
			var subTypesConfig = typeItem.DataValueSubTypeInfo;
			if (!subTypesConfig) {
				return null;
			}
			var subTypeItem;
			if (subTypeValue && dataValueType === Terrasoft.DataValueType.TEXT) {
				subTypeItem = getItemByAttribute(subTypesConfig, subTypeValue, "Size");
				return subTypeItem.Caption;
			} else if (subTypeValue && dataValueType === Terrasoft.DataValueType.FLOAT) {
				subTypeItem = getItemByAttribute(subTypesConfig, subTypeValue, "Precision");
				return subTypeItem.Caption;
			} else {
				return null;
			}
		}

		/**
		 * Получает элемент из масива по значению и атрибуту.
		 * @private
		 * @param {Array} arr Текущий масив.
		 * @param {Number} value Значение атрибута подтипа (Size или Precision).
		 * @param {String} attr Aтрибут типа или подтипа.
		 * @return {Object} Элемент масива.
		 */
		function getItemByAttribute(arr, value, attr) {
			var itemConf = null;
			Terrasoft.each(arr, function(item) {
				if (item[attr] === value) {
					itemConf = item;
					return false;
				}
			});
			return itemConf;
		}

		/**
		 * Функция формирует конфиг модели представления в зависимости от типа данных колонки.
		 * @param {Terrasoft.DataValueType} dataValueType - тип данных колонки
		 */
		function getViewModelConfigByDataValueType(dataValueType) {
			var maxEntitySchemaNameLength;
			SectionDesignerUtils.getMaxEntitySchemaNameLength(function(maxSchemaNameLengthValue) {
				maxEntitySchemaNameLength = maxSchemaNameLengthValue;
			});
			var config = {};
			switch (dataValueType) {
				case Terrasoft.DataValueType.TEXT:
					config.columns = {
						lineSizeList: {
							dataValueType: Terrasoft.DataValueType.ENUM,
							isCollection: true
						},
						lineSize: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							dataValueType: Terrasoft.DataValueType.LOOKUP
						},
						multiLine: {
							dataValueType: Terrasoft.DataValueType.BOOLEAN
						}
					};
					break;
				case Terrasoft.DataValueType.FLOAT:
				case Terrasoft.DataValueType.MONEY:
					config.columns = {
						precisionList: {
							dataValueType: Terrasoft.DataValueType.ENUM,
							isCollection: true
						},
						precision: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							dataValueType: Terrasoft.DataValueType.LOOKUP
						}
					};
					break;
				case Terrasoft.DataValueType.DATE:
				case Terrasoft.DataValueType.TIME:
				case Terrasoft.DataValueType.DATE_TIME:
					config.columns = {
						formatList: {
							dataValueType: Terrasoft.DataValueType.ENUM,
							isCollection: true
						},
						format: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							dataValueType: Terrasoft.DataValueType.LOOKUP
						}
					};
					break;
				case Terrasoft.DataValueType.LOOKUP:
					config.columns = {
						isNewLookup: {
							dataValueType: Terrasoft.DataValueType.BOOLEAN
						},
						isExistLookup: {
							dataValueType: Terrasoft.DataValueType.BOOLEAN
						},
						lookup: {
							dataValueType: Terrasoft.DataValueType.LOOKUP,
							isLookup: true,
							referenceSchema: {
								name: "VwSysEntitySchemaInWorkspace",
								primaryColumnName: "Id",
								primaryDisplayColumnName: "Name"
							},
							referenceSchemaName: "VwSysEntitySchemaInWorkspace"
						},
						lookupList: {
							isCollection: true,
							name: "lookupList",
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
						},
						lookupCaption: {
							type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
							dataValueType: Terrasoft.DataValueType.TEXT
						},
						lookupName: {
							type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
							dataValueType: Terrasoft.DataValueType.TEXT
						},
						isListView: {
							dataValueType: Terrasoft.DataValueType.BOOLEAN
						},
						likeNames: {
							dataValueType: Terrasoft.DataValueType.ENUM,
							isCollection: true
						}
					};

					config.validationConfig = {
						lookupName: [
							function(value) {
								var isNewLookup = this.get("isNewLookup");
								if (isNewLookup && Ext.isEmpty(value)) {
									return {
										invalidMessage: localizableStrings.InvalidRequireMessage
									};
								}
								return {
									invalidMessage: ""
								};
							},
							function(value) {
								var isNewLookup = this.get("isNewLookup");
								if (!isNewLookup) {
									return {
										invalidMessage: ""
									};
								}
								var valid = SectionDesignerUtils.validateNamePrefix(value);
								if (!valid) {
									var invalidMessage = Ext.String.format(localizableStrings.WrongPrefixMessage,
										SectionDesignerUtils.getSchemaNamePrefix());
									return {
										invalidMessage: invalidMessage
									};
								}
								return {
									invalidMessage: ""
								};
							},
							function(value) {
								var result = SectionDesignerUtils.validateSystemName(value, {
									maxLength: maxEntitySchemaNameLength
								});

								var invalidMessage = localizableStrings.WrongSchemaNameMessage;
								if (!result.isValid) {
									return {
										invalidMessage: invalidMessage
									};
								}
								return {
									invalidMessage: ""
								};
							},
							function(value) {
								var likeNames = this.get("likeNames");
								var invalidMessage = localizableStrings.WrongMessageExistSchem;
								if (likeNames) {
									if (likeNames.length > 0) {
										if (likeNames.indexOf(value) !== -1) {
											return {
												invalidMessage: invalidMessage
											};
										}
									}
								}
								return {
									invalidMessage: ""
								};
							}
						],
						lookupCaption: [
							function(value) {
								var isNewLookup = this.get("isNewLookup");
								if (isNewLookup && Ext.isEmpty(value)) {
									return {
										invalidMessage: localizableStrings.InvalidRequireMessage
									};
								}
								return {
									invalidMessage: ""
								};
							}
						],
						lookup: [
							function(value) {
								var isExistLookup = this.get("isExistLookup");
								if (isExistLookup && Ext.isEmpty(value)) {
									return {
										invalidMessage: localizableStrings.InvalidRequireMessage
									};
								}
								return {
									invalidMessage: ""
								};
							}
						]
					};
					break;
			}
			return config;
		}

		/**
		 * Функция установки значений в модель представления при редактировании колонки.
		 * @param {Object} config - конфиг редактируемой колонки
		 * @param {Terrasoft.BaseViewModel} viewModel - модель представления
		 */
		function setViewModelValues(config, viewModel) {
			viewModel.set("hasConverter", false);
			viewModel.set("columnName", config.column.name, {preventValidation: true});
			var designerViewModel = config.scope;
			var itemConfig = designerViewModel.getSchemaItemInfoByName(config.column.name);
			var itemCaption = itemConfig.item.caption;
			if (itemCaption && itemCaption.bindConfig && itemCaption.bindConfig.converter) {
				viewModel.set("hasConverter", true);
				viewModel.set("columnCaptionPlaceholder", localizableStrings.BusinessLogicMessage);
			} else {
				viewModel.set("columnCaption", config.column.caption);
			}
			setConverterFlag(itemConfig.item);
			if (config.dataValueType === Terrasoft.DataValueType.TEXT) {
				var lineSize;
				if (Ext.isObject(config.column.size)) {
					lineSize = config.column.size;
				} else {
					lineSize = {
						value: config.column.size || 0,
						displayValue: getDisplayValueLineSize(config.column.size)
					};
				}
				viewModel.set("lineSize", lineSize);
			}
			if (!Ext.isEmpty(config.contentType)) {
				switch (config.contentType) {
					case 0:
						viewModel.set("multiLine", true);
						break;
					case 3:
						viewModel.set("isListView", true);
						break;
					default:
						viewModel.set("multiLine", false);
						viewModel.set("isListView", false);
						break;
				}
			}

			viewModel.set("require", config.column.isRequired);
			viewModel.set("readOnly", config.readOnly);
			var precision;
			if	(Ext.isObject(config.column.precision)) {
				precision = config.column.precision;
			} else {
				precision = {
					value: config.column.precision,
					displayValue: getDisplayValuePrecision(config.column.precision)
				};
			}
			viewModel.set("precision", precision);
			var format = getDateFormatByDataValueType(config.dataValueType);
			viewModel.set("format", format);
			var hideCaption = (config.labelConfig.visible === false);
			viewModel.set("hideCaption", hideCaption);
			var textSize = getTextSizeByValue(config.textSize);
			viewModel.set("textSize", textSize);
			function entitySchemaCallback(schema) {
				viewModel.set("lookup", {
					value: schema.uId,
					displayValue: schema.caption,
					name: schema.name
				});
				Terrasoft.Mask.hide(maskId);
			}

			if (config.column.referenceSchema) {
				var maskId;

				var referenceSchemaName = config.column.referenceSchemaName;
				if (!referenceSchemaName) {
					var schema = config.column.referenceSchema;
					viewModel.set("lookup", {
						value: schema.uId,
						displayValue: schema.caption,
						name: schema.name
					});
				} else {
					var element = ModalBox.getFixedBox();
					var elementSelector = "#" + element.id;
					maskId = Terrasoft.Mask.show({
						selector: elementSelector
					});
					SectionDesignDataModule.getEntitySchemaByName({
						name: referenceSchemaName,
						callback: entitySchemaCallback
					});
				}
			}

			var callback = function(value) {
				viewModel.set("isEditMode", value);
			};
			SectionDesignerUtils.isExistColumn({
				schemaName: config.entitySchema.name,
				name: config.column.name,
				callback: callback
			});
		}

		/**
		 * Устанавливает признак конвертора, если найдено свойство элемента "converter".
		 * @param {Object} obj Проверяемый объект.
		 * @return {Boolean} Возвращает true, если свойство найдено.
		 */
		function setConverterFlag(obj) {
			Terrasoft.each(obj, function(item, key) {
				if (Ext.isObject(item)) {
					setConverterFlag(item, "converter");
				}
				if (key === "converter") {
					viewModel.set("hasConverter", true);
					return false;
				}
			}, this);
		}

		function getTextSizeByValue(value) {
			var textSize = {};
			switch (value) {
				case Terrasoft.TextSize.STANDARD:
					textSize = {
						value: Terrasoft.TextSize.STANDARD,
						displayValue: localizableStrings.StandardTextSizeCaption
					};
					break;
				case Terrasoft.TextSize.LARGE:
					textSize = {
						value: Terrasoft.TextSize.LARGE,
						displayValue: localizableStrings.LargeTextSizeCaption
					};
					break;
				default:
					textSize = {
						value: "Default",
						displayValue: localizableStrings.DefaultCaption
					};
					break;
			}
			return textSize;
		}

		/**
		 * Функция формирования списка возможных вариантов точности для колонки типа "Дробное число".
		 * @param {Number} value - значение.
		 * @returns Возвращает объект по переданному значению для установки в выпадающий список.
		 */
		function getDisplayValuePrecision(value) {
			var displayValue = getCaptionByDataValueType(Terrasoft.DataValueType.FLOAT, value);
			return displayValue;
		}

		/**
		 * Функция формирования списка возможных вариантов длины строки для колонки типа "Строка".
		 * @param {String} value - значение.
		 * @returns Возвращает объект по переданному значению для установки в выпадающий список.
		 */
		function getDisplayValueLineSize(value) {
			var displayValue = getCaptionByDataValueType(Terrasoft.DataValueType.TEXT, value);
			return displayValue;
		}

		function prepareColumnList() {
			var collection = this.get("columnList");
			var schema = this.get("schema");
			collection.clear();
			var columnCollection = Ext.create("Terrasoft.Collection");
			Terrasoft.each(schema.entitySchema.columns, function(item) {
				if (item.usageType !== 0 ||
					item.dataValueType === Terrasoft.DataValueType.GUID ||
					item.dataValueType === Terrasoft.DataValueType.BLOB ||
					item.dataValueType === Terrasoft.DataValueType.IMAGE ||
					item.dataValueType === Terrasoft.DataValueType.CUSTOM_OBJECT ||
					item.dataValueType === Terrasoft.DataValueType.IMAGELOOKUP ||
					item.dataValueType === Terrasoft.DataValueType.COLLECTION ||
					item.dataValueType === Terrasoft.DataValueType.COLOR) {
					return;
				}
				var columnConfig = {
					value: item.name,
					displayValue: item.caption
				};
				columnCollection.add(item.name, columnConfig);
			});
			if (schema.attributes) {
				Terrasoft.each(schema.attributes, function(item) {
					if (!columnCollection.find(item.name)) {
						var columnConfig = {
							value: item.name,
							displayValue: item.caption || item.name
						};
						columnCollection.add(item.name, columnConfig);
					}
				});
			}
			collection.loadAll(columnCollection);
		}

		function prepareLookupList() {
			var lookupCollection = viewModel.get("lookupList");
			lookupCollection.clear();
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "VwSysEntitySchemaInWorkspace"
			});
			select.isDistinct = true;
			select.addColumn("UId");
			select.addColumn("Caption");
			select.addColumn("Name");
			select.filters.add(getLookupFilters());
			select.getEntityCollection(function(result) {
				if (result.success) {
					var collection = Ext.create("Terrasoft.Collection");
					var items = result.collection.collection.items;
					Terrasoft.each(items, function(item) {
						var config = {
							value: item.values.UId,
							name:  item.values.Name,
							displayValue: item.values.Caption
						};
						collection.add(item.values.Id, config);
					});
					lookupCollection.loadAll(collection);
				}
			}, this);
		}

		function getLookupFilters() {
			var filterCollection = Terrasoft.createFilterGroup();
			filterCollection.add("SysWorkspaceId", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "SysWorkspace", Terrasoft.SysValue.CURRENT_WORKSPACE.value));
			filterCollection.add("ExtendParent", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "ExtendParent", false));
			return filterCollection;
		}

		function subscribeEvents() {
			viewModel.on("change:isNewLookup", onSwitchLookup, this);
		}

		var isFireEvent = false;
		function onSwitchLookup() {
			var value = arguments[1];
			//var isFireEvent = viewModel.get("isFireEvent");
			if (isFireEvent) {
				viewModel.set("isExistLookup", !value);
			} else {
				isFireEvent = true;
				viewModel.set("isNewLookup", !value);
				viewModel.set("isExistLookup", value);
			}
		}

		function prepareTextSize() {
			var collection = this.get("textSizeList");
			collection.clear();
			var sizes = {
				"Default": {
					value: 2,
					displayValue: localizableStrings.DefaultCaption
				},
				"LARGE": {
					value: Terrasoft.TextSize.LARGE,
					displayValue: localizableStrings.LargeTextSizeCaption
				},
				"STANDARD": {
					value: Terrasoft.TextSize.STANDARD,
					displayValue: localizableStrings.StandardTextSizeCaption
				}
			};
			collection.loadAll(sizes);
		}

		function prepareFormatList() {
			var collection = this.get("formatList");
			collection.clear();
			var formats = {
				"DateTime": {
					value: "DateTime",
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.DATE_TIME)
				},
				"Date": {
					value: "Date",
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.DATE)
				},
				"Time": {
					value: "Time",
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.TIME)
				}
			};
			collection.loadAll(formats);
		}

		function preparePrecision() {
			var collection = this.get("precisionList");
			collection.clear();
			var precisions = {
				"1": {
					value: 1,
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.FLOAT, 1)
				},
				"2": {
					value: 2,
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.FLOAT, 2)
				},
				"3": {
					value: 3,
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.FLOAT, 3)
				},
				"4": {
					value: 4,
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.FLOAT, 4)
				}
			};
			collection.loadAll(precisions);
		}

		function prepareLineSize() {
			var collection = this.get("lineSizeList");
			collection.clear();
			var sizes = {
				"50": {
					value: 50,
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.TEXT, 50)
				},
				"250": {
					value: 250,
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.TEXT, 250)
				},
				"500": {
					value: 500,
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.TEXT, 500)
				},
				"-1": {
					value: -1,
					displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.TEXT, -1)
				}
			};
			collection.loadAll(sizes);
		}

		/**
		 * Обработчик события нажатия на кнопку сохранения.
		 * @private
		 */
		function onSaveClick() {
			var hasConverter =  this.get("hasConverter");
			if (hasConverter && viewModel.validate()) {
				Terrasoft.utils.showMessage({
					caption: localizableStrings.SaveColumnWarning,
					buttons: ["Yes", "No"],
					defaultButton: 0,
					style: Terrasoft.MessageBoxStyles.BLUE,
					handler: function(val) {
						if (val === "no") {
							ModalBox.close();
							MaskHelper.HideBodyMask();
						} else if (val === "yes") {
							saveColumn.call(this);
						}
					}
				});
			} else {
				saveColumn.call(this);
			}
		}

		/**
		 * Обработчик события нажатия на кнопку сохранения.
		 * @private
		 */
		function saveColumn() {
			var entityColumn = viewModel.get("entityColumn");
			MaskHelper.ShowBodyMask();
			var lookupName = viewModel.get("lookupName");
			var self = this;
			if (lookupName && entityColumn.isNew) {
				SectionDesignDataModule.loadLikeSchemaNames(lookupName, function(codeLikeSchema) {
					self.set("likeNames", codeLikeSchema);
					if (self.validate()) {
						var entityColumn = self.get("entityColumn");
						generateItemConfig(entityColumn);
						ModalBox.close();
					}
				});
			} else {
				if (!viewModel.validate()) {
					MaskHelper.HideBodyMask();
					return;
				}
				generateItemConfig(entityColumn);
				ModalBox.close();
			}
			MaskHelper.HideBodyMask();
		}

		function generateItemConfig(entityColumn) {
			var name = viewModel.get("columnName");
			var caption = viewModel.get("columnCaption");
			var designerViewModel = entityColumnConfig.scope;
			var captionResourceName = "Resources.Strings." + name + "Caption";
			designerViewModel.set(captionResourceName, caption, {"columnName": captionResourceName});
			var prefix = SectionDesignerUtils.getSchemaNamePrefix();
			if (entityColumn.isNew && !Ext.isEmpty(prefix)) {
				if (!SectionDesignerUtils.validateNamePrefix(name)) {
					name = prefix + name;
				}
			}
			entityColumn.name = name;
			entityColumn.caption = caption;
			entityColumn.isRequired = viewModel.get("require");
			entityColumn.usageType = ConfigurationEnums.EntitySchemaColumnUsageType.General;
			var extColumnConfig = {};
			var textSize = viewModel.get("textSize");
			if (!textSize || textSize.value === 2) {
				textSize = 0;
			} else {
				textSize = textSize.value;
			}
			var itemConfig = {
				caption: {
					bindTo: captionResourceName
				},
				labelConfig: {
					visible: !viewModel.get("hideCaption")
				},
				readOnly: viewModel.get("readOnly"),
				textSize: textSize
			};
			var type = parseInt(entityColumn.dataValueType, 10);
			var value;
			switch (type) {
				case Terrasoft.DataValueType.TEXT:
					var size = viewModel.get("lineSize");
					if (!size) {
						value = 250;
					} else {
						value = size.value;
					}
					if (value !== 0) {
						extColumnConfig = {
							size: value
						};
					}
					var multiLine = viewModel.get("multiLine");
					itemConfig.contentType = (multiLine) ? Terrasoft.ContentType.LONG_TEXT :
						Terrasoft.ContentType.SHORT_TEXT;
					break;
				case Terrasoft.DataValueType.FLOAT:
					var precision = viewModel.get("precision");
					if (!precision) {
						value = 2;
					} else {
						value = precision.value;
					}
					extColumnConfig = {
						precision: value
					};
					break;
				case Terrasoft.DataValueType.DATE:
				case Terrasoft.DataValueType.TIME:
				case Terrasoft.DataValueType.DATE_TIME:
					var dataValueType = viewModel.get("format");
					if (!dataValueType) {
						entityColumn.dataValueType = Terrasoft.DataValueType.DATE_TIME;
					} else {
						entityColumn.dataValueType = getDataValueTypeFromBaseDataType(dataValueType.value);
					}
					break;
				case Terrasoft.DataValueType.LOOKUP:
					var isNewLookup = viewModel.get("isNewLookup");
					var referenceSchemaName = viewModel.get("lookupName");
					var referenceSchemaCaption = viewModel.get("lookupCaption");
					if (isNewLookup) {
						extColumnConfig = {
							referenceSchema: {},
							referenceSchemaName: referenceSchemaName,
							referenceSchemaCaption: referenceSchemaCaption
						};
						SectionDesignDataModule.createEntitySchema({
							name: referenceSchemaName,
							caption: referenceSchemaCaption,
							rootEntitySchema: BaseLookup
						});
					} else {
						var lookup = viewModel.get("lookup");
						var reference = entityColumn.referenceSchema || {};
						var referenceSchemaUid = lookup.value;
						Ext.apply(reference, {
							uId: referenceSchemaUid,
							name: lookup.name,
							caption: lookup.displayValue
						});
						extColumnConfig = {
							referenceSchema: reference,
							referenceSchemaName: lookup.name,
							referenceSchemaCaption: "",
							referenceSchemaUid: referenceSchemaUid
						};
					}
					var isListView = viewModel.get("isListView");
					itemConfig.contentType = (isListView) ? Terrasoft.ContentType.ENUM :
						Terrasoft.ContentType.LOOKUP;
					break;
			}
			Ext.apply(entityColumn, extColumnConfig);
			Ext.apply(entityColumnConfig, itemConfig);
			entityColumnConfig.callback.call(entityColumnConfig.scope, entityColumnConfig);
		}

		function getDataValueTypeFromBaseDataType(baseDataType) {
			switch (baseDataType) {
				case "DateTime":
					return Terrasoft.DataValueType.DATE_TIME;
				case "Date":
					return Terrasoft.DataValueType.DATE;
				case "Time":
					return Terrasoft.DataValueType.TIME;
			}
			return null;
		}

		function getDateFormatByDataValueType(dataValueType) {
			var format;
			switch (dataValueType) {
				case Terrasoft.DataValueType.DATE_TIME:
					format = {
						value: "DateTime",
						displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.DATE_TIME)
					};
					break;
				case Terrasoft.DataValueType.DATE:
					format = {
						value: "Date",
						displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.DATE)
					};
					break;
				case Terrasoft.DataValueType.TIME:
					format = {
						value: "Time",
						displayValue: getCaptionByDataValueType(Terrasoft.DataValueType.TIME)
					};
					break;
			}
			return format;
		}

		function onCancelClick() {
			ModalBox.close();
		}

		function generateEntityColumnByDataValueType(dataValueType) {
			return {
				isNew: true,
				uId: Terrasoft.generateGUID(),
				name: "",
				caption: "",
				dataValueType: dataValueType,
				isLookup: dataValueType === Terrasoft.DataValueType.LOOKUP ||
					dataValueType === Terrasoft.DataValueType.ENUM,
				isRequired: false
			};
		}

		/**
		 * Функция создания модели представления окна добавления или редактирования группы.
		 * @param {Object} groupConfig Конфигурационный объект группы.
		 * @param {String} groupConfig.name Имя группы.
		 * @param {String} groupConfig.caption Заголовок группы.
		 * @returns {Terrasoft.BaseViewModel} Сгенерированная модель представления.
		 */
		function createGroupWindowViewModel(groupConfig) {
			var viewModel;
			var cfg = {
				values: {
					headerCaption: localizableStrings.GroupHeaderCaption,
					GroupCaption: groupConfig.caption
				},
				methods: {
					onSaved: Ext.emptyFn,

					/**
					 * Обработчик события нажатия на кнопку "Сохранить".
					 * @private
					 */
					onSaveClick: function() {
						var validation = this.validate();
						if (!validation) {
							return;
						}
						var group = {
							caption: this.get("GroupCaption"),
							name: groupConfig.name
						};
						this.onSaved(group);
						ModalBox.close();
					},

					/**
					 * Обработчик события нажатия на кнопку "Отменить".
					 * @private
					 */
					onCancelClick: function() {
						ModalBox.close();
					}
				}
			};
			viewModel = Ext.create("Terrasoft.BaseViewModel", cfg);
			return viewModel;
		}

		/**
		 * Функция создания представления окна добавления или редактирования группы.
		 * @returns {Terrasoft.Container} Сгенерированное представление окна.
		 */
		function createGroupWindowView() {
			var view;
			var headerContainer = createHeaderContainer();
			var cfg = {
				className: "Terrasoft.Container",
				id: "groupMainContainer",
				selectors: {
					el: "#groupMainContainer",
					wrapEl: "#groupMainContainer"
				},
				classes: {
					wrapClassName: ["mainContainer"]
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "captionContainer",
						selectors: {
							wrapEl: "#captionContainer"
						},
						classes: {
							wrapClassName: ["captionContainer"]
						},
						items: headerContainer
					},
					{
						className: "Terrasoft.Container",
						id: "contentContainer",
						selectors: {
							wrapEl: "#contentContainer"
						},
						classes: {
							wrapClassName: ["contentContainer"]
						},
						items: [
							{
								className:  "Terrasoft.Container",
								id: "GroupNameLabeledContainer",
								selectors: {
									wrapEl: "#GroupNameLabeledContainer"
								},
								classes: {
									wrapClassName: ["base-element"]
								},
								items: [
									{
										className: "Terrasoft.Label",
										id: "GroupNameControlLabel",
										caption: localizableStrings.TitleCaption,
										classes: {labelClass: ["base-element-left"]}
									},
									{
										className: "Terrasoft.TextEdit",
										id: "GroupNameControl",
										classes: {
											wrapClass: ["base-element-right"]
										},
										value: {
											bindTo: "GroupCaption"
										}
									}
								]
							}
						]
					}
				]
			};
			view = Ext.create("Terrasoft.Container", cfg);
			return view;
		}

		/**
		 * Функция создания модального окна добавления или редактирования группы.
		 * @param {Terrasoft.BaseViewModel} scope Модель представления дизайнера страницы.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} groupConfig Конфигурационный объект группы.
		 * @param {String} groupConfig.name - имя группы.
		 * @param {String} groupConfig.caption - заголовок группы.
		 */
		function showEditGroupWindow(scope, callback, groupConfig) {
			var name = groupConfig.name || "group";
			var caption = groupConfig.caption || null;
			var groupConf = {
				name: name,
				caption: caption
			};
			var vm = createGroupWindowViewModel(groupConf);
			vm.onSaved = function(group) {
				callback.call(scope, group);
			};
			var view = createGroupWindowView();
			var modalBoxConfig = {};
			modalBoxConfig.container = ModalBox.show({
				widthPixels: 550,
				heightPixels: 200
			});
			view.bind(vm);
			view.render(modalBoxConfig.container);
		}

		/**
		 * Функция создания модели представления окна добавления или редактирования детали.
		 * @param {Object} parentSchema Cхема дизайнера страницы.
		 * @returns {Terrasoft.BaseViewModel} Сгенерированная модель представления.
		 */
		function createDetailWindowViewModel(parentSchema) {
			var viewModel;
			var cfg = {
				values: {
					headerCaption: localizableStrings.DetailHeaderCaption,
					parentSchema: parentSchema,
					detailCaption: null,
					selectedDetailName: null,
					selectedDetailColumn: null,
					selectedCurrentEntityColumn: null,
					detailNamesList: new Terrasoft.Collection(),
					detailColumnsList: new Terrasoft.Collection(),
					currentEntityColumnsList: new Terrasoft.Collection(),
					detailKey: null
				},
				columns: {
					"selectedDetailName": {
						isRequired: true
					},
					"selectedDetailColumn": {
						isRequired: true
					},
					"selectedCurrentEntityColumn": {
						isRequired: true
					}
				},
				validationConfig: {
					"selectedDetailName": [
						function(value) {
							return this.getValidationConfig(value);
						}
					],
					"selectedDetailColumn": [
						function(value) {
							return this.getValidationConfig(value);
						}
					],
					"selectedCurrentEntityColumn": [
						function(value) {
							return this.getValidationConfig(value);
						}
					]
				},
				methods: {
					/**
					 * Функция получения конфигурации валидатора
					 * @private
					 * @returns {Object} Возвращает конфигурационный объект валидатора
					 */
					getValidationConfig: function(value) {
						return Ext.Object.isEmpty(value)
							? {invalidMessage: localizableStrings.ValidatorInfo}
							: {invalidMessage: ""};
					},

					/**
					 * Функция получения списка деталей из базы данных.
					 * @private
					 * @param {Object} filter Фильтр
					 * @param {Terrasoft.Collection} list Коллекция выпадающего списка имен деталей.
					 * @param {Object} addConf Конфигурационный объект.
					 * @param {Function} addConf.completeDetailConfig Функция обратного вызова для заполнения
					 * конфигурационного объекта детали.
					 * @param {Object} addConf.selectedDetailConf Конфигурационный объект выбранной детали.
					 */
					getDetailNamesList: function(filter, list, addConf) {
						var select = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "SysDetail"
						});
						select.isDistinct = true;
						var primaryDisplayColumn = Ext.create("Terrasoft.EntityQueryColumn", {
							columnPath: "Caption",
							orderDirection: Terrasoft.OrderDirection.ASC,
							orderPosition: 0
						});
						select.addColumn(primaryDisplayColumn, "Caption");
						select.addColumn("Id");
						select.addColumn("DetailSchemaUId");
						select.addColumn("EntitySchemaUId");
						select.addColumn("[VwSysSchemaInfo:UId:DetailSchemaUId].Name", "Name");
						select.addColumn("[SysSchema:UId:EntitySchemaUId].Name", "SchemaName");
						select.getEntityCollection(function(result) {
							if (result.success) {
								if (!addConf) {
									this.fillDetailNamesList(result, filter, list);
								} else {
									var callback = addConf.completeDetailConfig;
									var selectedDetailConf = addConf.selectedDetailConf;
									callback.call(this, result, selectedDetailConf);
								}
							}
						}, this);
					},

					/**
					 * Функция заполнения коллекции выпадающего списка имен деталей.
					 * @private
					 * @param {Terrasoft.Collection} response Результат выборки деталей из базы данных.
					 * @param {Object} filter Фильтр.
					 * @param {Terrasoft.Collection} list Коллекция выпадающего списка имен деталей.
					 */
					fillDetailNamesList: function(response, filter, list) {
						var detailNamesArray = response.collection.collection.items;
						if (list === null) {
							return;
						}
						list.clear();
						var columns = {};
						Terrasoft.each(detailNamesArray, function(detailItem) {
							var id = detailItem.get("Id");
							var caption = detailItem.get("Caption");
							var entitySchemaUId = detailItem.get("EntitySchemaUId");
							var entitySchemaName = detailItem.get("SchemaName");
							var detailName = detailItem.get("Name");
							var item = {
								displayValue: caption,
								detailCaption: caption,
								value: id,
								detailName: detailName,
								entitySchemaUId: entitySchemaUId,
								entitySchemaName: entitySchemaName
							};
							columns[id] = item;
							if (!list.contains(id)) {
								columns[id] = item;
							}
						}, this);
						list.loadAll(columns);
					},

					/**
					 * Функция заполнения списка колонок выбранной детали.
					 * @private
					 * @param {Object} filter Фильтр.
					 * @param {Terrasoft.Collection} list Коллекция выпадающего списка имен деталей.
					 */
					getDetailColumnsList: function(filter, list) {
						var selectedDetailName = this.get("selectedDetailName");
						var entitySchemaUId = selectedDetailName && selectedDetailName.entitySchemaUId;
						if (!entitySchemaUId || list === null) {
							return;
						}
						var config = {
							id: entitySchemaUId,
							callback: function(entitySchema) {
								var entitySchemaColumns = entitySchema.columns;
								var columns = {};
								list.clear();
								Terrasoft.each(entitySchemaColumns, function(item) {
									var it = {
										displayValue: item.caption,
										value: item.name
									};
									if (!list.contains(item.name)) {
										columns[item.name] = it;
									}
								}, this);
								list.loadAll(columns);
							},
							scope: this
						};
						SectionDesignDataModule.getEntitySchemaByUId(config);
					},

					/**
					 * Проверяет выбрана ли деталь.
					 * @private
					 * @param {Object} selectedDetail Объект выбранной детали.
					 * @return {Boolean} Возвращает true если деталь выбрана, false - в обратном случае.
					 */
					checkOrDetailSelected: function(selectedDetail) {
						return !Ext.isEmpty(selectedDetail);
					},

					/**
					 * Функция заполнения списка колонок текущего объекта.
					 * @private
					 * @param {Object} filter Фильтр.
					 * @param {Terrasoft.Collection} list Коллекция выпадающего списка имен деталей.
					 */
					getCurrentEntityColumnsList: function(filter, list) {
						if (list === null) {
							return;
						}
						var entitySchemaColumns = this.get("parentSchema").entitySchema.columns;
						var columns = {};
						list.clear();
						Terrasoft.each(entitySchemaColumns, function(item) {
							var it = {
								displayValue: item.caption,
								value: item.name
							};
							if (!list.contains(item.name)) {
								columns[item.name] = it;
							}
						}, this);
						list.loadAll(columns);
					},

					onSaved: Ext.emptyFn,

					/**
					 * Обработчик события нажатия на кнопку "Сохранить".
					 * @private
					 */
					onSaveClick: function() {
						var validation = this.validate();
						if (!validation) {
							return;
						}
						var detail = {};
						var selectedDetail = this.get("selectedDetailName");
						var detailColumn = this.get("selectedDetailColumn").value;
						var masterColumn = this.get("selectedCurrentEntityColumn").value;
						detail.entitySchema = selectedDetail.entitySchemaName;
						detail.name = selectedDetail.detailName;
						detail.caption = this.get("detailCaption");
						detail.filter = {
							detailColumn: detailColumn,
							masterColumn: masterColumn
						};
						detail.detailKey = this.get("detailKey");
						this.createDetailGridSettings(selectedDetail, function(gridSettings) {
							detail.gridSettings = gridSettings;
							this.onSaved(detail);
							ModalBox.close();
						}, this);
					},

					/**
					 * Создает настройки профиля детали.
					 * @private
					 * @param {Object} selectedDetail Деталь.
					 * @param {Function} callback Функция обратного вызова.
					 * @param {Function} scope Контекст вызова функции обратного вызова.
					 */
					createDetailGridSettings: function(selectedDetail, callback, scope) {
						Terrasoft.require([selectedDetail.entitySchemaName], function(entitySchema) {
							var columnName = entitySchema.primaryDisplayColumnName || entitySchema.primaryColumnName;
							var entitySchemaColumns = entitySchema.columns;
							var column = entitySchemaColumns[columnName];
							var parentSchema = this.get("parentSchema");
							var parentSchemaName = parentSchema.schemaName;
							var detailName = selectedDetail.detailName;
							if (!detailName || !parentSchemaName) {
								callback.call(scope);
								return;
							}
							var profileKey = parentSchemaName + detailName;
							var columnConfig = {
								bindTo: columnName,
								caption: column.caption,
								captionConfig: {
									visible: true
								},
								orderDirection: Terrasoft.OrderDirection.ASC,
								orderPosition: 1,
								position: {
									column: 0,
									colSpan: 24,
									row: 1
								}
							};
							var gridSettings = {
								key: profileKey,
								data: Terrasoft.encode({
									key: profileKey,
									isCollapsed: false,
									DataGrid: {
										isTiled: false,
										type: Terrasoft.GridType.LISTED,
										key: profileKey,
										listedConfig: Terrasoft.encode({
											items: [
												columnConfig
											]
										}),
										tiledConfig: Terrasoft.encode({
											grid: {
												columns: 24,
												rows: 1
											},
											items: [
												columnConfig
											]
										})
									}
								}),
								isDef: true
							};
							callback.call(scope, gridSettings);
						}, this);
					},

					/**
					 * Обработчик события нажатия на кнопку "Отменить".
					 * @private
					 */
					onCancelClick: function() {
						ModalBox.close();
					},

					/**
					 * Функция получение заголовка поля "Колонка объекта".
					 * @private
					 */
					getCurrentEntityCaption: function() {
						var schema = this.get("parentSchema");
						var objCaption = schema.entitySchema.caption;
						return localizableStrings.DetailObjectColumnCaption + " '" + objCaption + "'";
					}
				}
			};
			viewModel = Ext.create("Terrasoft.BaseViewModel", cfg);
			viewModel.on("change:selectedDetailName", function(val) {
				var detail = val.get("selectedDetailName");
				if (!detail) {
					return;
				}
				var detailCaption = detail.detailCaption;
				this.set("detailCaption", detailCaption);
				this.set("detailColumnsList", new Terrasoft.Collection());
				this.set("selectedDetailColumn", null);
			}, viewModel);
			return viewModel;
		}

		/**
		 * Функция создания представления окна добавления или редактирования детали.
		 * @param {Object} config Конфигурационный объект представления окна детали.
		 * @param {Boolean} config.isCaptionEditable Признак того, что заголовок редактируемый.
		 * @returns {Terrasoft.Container} Сгенерированое представление окна.
		 */
		function createDetailWindowView(config) {
			if (!config) {
				config = {};
			}
			var view;
			var headerContainer = createHeaderContainer();
			var cfg = {
				className: "Terrasoft.Container",
				id: "detailMainContainer",
				selectors: {
					el: "#detailMainContainer",
					wrapEl: "#detailMainContainer"
				},
				classes: {
					wrapClassName: ["mainContainer"]
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "captionContainer",
						selectors: {
							wrapEl: "#captionContainer"
						},
						classes: {
							wrapClassName: ["captionContainer"]
						},
						items: headerContainer
					},
					{
						className: "Terrasoft.Container",
						id: "contentContainer",
						selectors: {
							wrapEl: "#contentContainer"
						},
						classes: {
							wrapClassName: ["contentContainer"]
						},
						items: [
							{
								className:  "Terrasoft.Container",
								id: "DetailNameLabeledContainer",
								selectors: {
									wrapEl: "#DetailNameLabeledContainer"
								},
								classes: {
									wrapClassName: ["base-element"]
								},
								items: [
									{
										className: "Terrasoft.Label",
										id: "DetailNameControlLabel",
										caption: localizableStrings.DetailNameCaption,
										classes: {labelClass: ["base-element-left"]},
										isRequired: true
									},
									{
										className: "Terrasoft.ComboBoxEdit",
										id: "DetailNameControl",
										list: {
											bindTo: "detailNamesList"
										},
										prepareList: {
											bindTo: "getDetailNamesList"
										},
										value: {
											bindTo: "selectedDetailName"
										},
										classes: {
											wrapClass: ["base-element-right"]
										},
										markerValue: "detailName"
									}
								]
							}, {
								className:  "Terrasoft.Container",
								id: "CaptionLabeledContainer",
								selectors: {
									wrapEl: "#CaptionLabeledContainer"
								},
								classes: {
									wrapClassName: ["base-element"]
								},
								items: [
									{
										className: "Terrasoft.Label",
										id: "CaptionControlLabel",
										caption: localizableStrings.TitleCaption,
										classes: {labelClass: ["base-element-left"]}
									},
									{
										className: "Terrasoft.TextEdit",
										id: "CaptionControl",
										classes: {wrapClass: ["base-element-right"]},
										value: {bindTo: "detailCaption"},
										readonly: (config.isCaptionEditable === true) ? false : true
									}
								]
							}, {
								className:  "Terrasoft.Container",
								id: "DetailColumnLabeledContainer",
								selectors: {
									wrapEl: "#DetailColumnLabeledContainer"
								},
								classes: {
									wrapClassName: ["base-element"]
								},
								items: [
									{
										className: "Terrasoft.Label",
										id: "DetailColumnControlLabel",
										caption: localizableStrings.DetailColumnsCaption,
										classes: {labelClass: ["base-element-left"]},
										isRequired: true
									},
									{
										className: "Terrasoft.ComboBoxEdit",
										id: "DetailColumnControl",
										list: {bindTo: "detailColumnsList"},
										prepareList: {bindTo: "getDetailColumnsList"},
										value: {bindTo: "selectedDetailColumn"},
										enabled: {
											bindTo: "selectedDetailName",
											bindConfig: {converter: "checkOrDetailSelected"}
										},
										classes: {wrapClass: ["base-element-right"]},
										markerValue: "detailColumnName"
									}
								]
							}, {
								className:  "Terrasoft.Container",
								id: "ObjectColumnLabeledContainer",
								selectors: {
									wrapEl: "#ObjectColumnLabeledContainer"
								},
								classes: {
									wrapClassName: ["base-element"]
								},
								items: [
									{
										className: "Terrasoft.Label",
										id: "ObjectColumnControlLabel",
										caption: {bindTo: "getCurrentEntityCaption"},
										classes: {labelClass: ["base-element-left"]},
										isRequired: true
									}, {
										className: "Terrasoft.ComboBoxEdit",
										id: "ObjectColumnControl",
										classes: {
											wrapClass: ["base-element-right"]
										},
										value: {bindTo: "selectedCurrentEntityColumn"},
										list: {bindTo: "currentEntityColumnsList"},
										prepareList: {bindTo: "getCurrentEntityColumnsList"},
										markerValue: "objectColumnName"
									}
								]
							}
						]
					}
				]
			};
			view = Ext.create("Terrasoft.Container", cfg);
			return view;
		}

		/**
		 * Функция создания модального окна добавления или редактирования детали.
		 * @param {Terrasoft.BaseViewModel} scope Модель представления дизайнера страницы.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} selectedDetailConf Конфигурационный объект выбранной детали.
		 * @param {String} selectedDetailConf.detailKey - имя детали.
		 * @param {String} selectedDetailConf.detailSchemaName - имя схемы детали.
		 * @param {String} selectedDetailConf.detailColumn - колонка объекта детали.
		 * @param {String} selectedDetailConf.masterColumn - колонка текущего объекта.
		 * @param {Object} windowViewConfig Конфигурационный объект представления окна детали.
		 */
		function showEditDetailWindow(scope, callback, selectedDetailConf, windowViewConfig) {
			var parentSchema = scope.get("schema");
			var vm = createDetailWindowViewModel(parentSchema);
			vm.onSaved = function(detail) {
				callback.call(scope, detail);
			};
			var view = createDetailWindowView(windowViewConfig);
			var modalBoxConfig = {};
			modalBoxConfig.container = ModalBox.show({
				widthPixels: 550,
				heightPixels: 325
			});
			view.bind(vm);
			view.render(modalBoxConfig.container);
			if (!selectedDetailConf) {
				return;
			}
			vm.set("detailKey", selectedDetailConf.detailKey);
			var addConf = {
				completeDetailConfig: completeDetailConfig,
				selectedDetailConf: selectedDetailConf
			};
			vm.getDetailNamesList(null, vm.get("detailNamesList"), addConf);
			var masterSchemaName = scope.get("schema").entitySchemaName;
			var config = {
				name: masterSchemaName,
				callback: function(entitySchema) {
					if (!selectedDetailConf.masterColumn) {
						return;
					}
					var selectedMasterColumnCaption = entitySchema.columns[selectedDetailConf.masterColumn].caption;
					var selectedMasterColumn = {
						value: selectedDetailConf.masterColumn,
						displayValue: selectedMasterColumnCaption,
						customHtml: selectedDetailConf.masterColumn
					};
					vm.set("selectedCurrentEntityColumn", selectedMasterColumn);
				}
			};
			SectionDesignDataModule.getEntitySchemaByName(config);
		}

		/**
		 * Функция дозаполнения полей конфигурационного объекта для выбранной детали на основе выборки из базы данных.
		 * @param {Terrasoft.Collection} list Выборка всех деталей.
		 * @param {Object} selectedDetailConf Конфигурационный объект выбранной детали.
		 * @param {String} selectedDetailConf.id Уникальный идентификатор элемента.
		 * @param {String} selectedDetailConf.detailSchemaName Имя схемы выбранной детали.
		 * @param {String} selectedDetailConf.detailCaption Заголовок выбранной детали.
		 * @param {String} selectedDetailConf.entitySchemaUId UId объекта детали.
		 * @param {String} selectedDetailConf.entitySchemaName Имя схемы.
		 * @param {String} selectedDetailConf.displayValue Заголовок детали в выпадающем списке.
		 */
		function completeDetailConfig(list, selectedDetailConf) {
			var items = list.collection.collection.items;
			var detailSchemaName = selectedDetailConf.detailSchemaName;
			var entitySchemaName = selectedDetailConf.entitySchemaName;
			Terrasoft.each(items, function(item) {
				var values = item.values;
				if (values.Name === detailSchemaName && values.SchemaName === entitySchemaName) {
					if (Ext.isEmpty(selectedDetailConf.detailCaption)) {
						selectedDetailConf.detailCaption = item.values.Caption;
					}
					selectedDetailConf.displayValue = values.Caption;
					selectedDetailConf.entitySchemaUId = values.EntitySchemaUId;
					selectedDetailConf.id = item.get("Id");
					setSelectedDetailFields(selectedDetailConf, this);
					return false;
				}
			}, this);
		}

		/**
		 * Функция установки имени детали и колонки  модели представления для выбранной детали.
		 * @param {Object} selectedDetailConf Конфигурационный объект выбранной детали.
		 * @param {String} selectedDetailConf.entitySchemaUId UId объекта выбранной детали.
		 * @param {String} selectedDetailConf.detailSchemaName Имя схемы выбранной детали.
		 * @param {String} selectedDetailConf.detailCaption Заголовок выбранной детали.
		 * @param {String} selectedDetailConf.detailColumn Колонка детали.
		 * @param {String} selectedDetailConf.masterColumn Колонка текущего объекта.
		 * @param {Terrasoft.BaseViewModel} vm Модель представления сервисного окна.
		 */
		function setSelectedDetailFields(selectedDetailConf, vm) {
			var config = {
				id: selectedDetailConf.entitySchemaUId,
				callback: function(entitySchema) {
					var selectedDetail = {
						value: selectedDetailConf.id,
						displayValue: selectedDetailConf.displayValue,
						detailName: selectedDetailConf.detailSchemaName,
						detailCaption: selectedDetailConf.detailCaption,
						entitySchemaUId: entitySchema.uId,
						entitySchemaName: selectedDetailConf.entitySchemaName
					};
					vm.set("selectedDetailName", selectedDetail);
					if (!selectedDetailConf.detailColumn) {
						return;
					}
					var selectedDetailColumnCaption = entitySchema.columns[selectedDetailConf.detailColumn].caption;
					var selectedDetailColumn = {
						value: selectedDetailConf.detailColumn,
						displayValue: selectedDetailColumnCaption,
						customHtml: selectedDetailConf.detailColumn
					};
					vm.set("selectedDetailColumn", selectedDetailColumn);
				},
				scope: this
			};
			SectionDesignDataModule.getEntitySchemaByUId(config);
		}

		/**
		 * Функция создания модели представления ряда.
		 * @param {Object} item Конфигурационный объект элемента.
		 * @param {String} item.caption Значение колонки заголовок.
		 * @param {String} item.name Значение колонки имя.
		 * @param {Number} item.position Позиция ряда.
		 * @param {Function} onEdit Функция обратного вызова редактирования ряда.
		 * @param {Function} onDelete Функция обратного вызова удаления ряда.
		 * @param {Terrasoft.BaseViewModel} scope Модель представления окна.
		 * @param {Boolean} extendedMode Признак расширенного режима.
		 * @param {Boolean} showCode Признак отображения колонки "код".
		 * @returns {Terrasoft.BaseViewModel} resultViewModel Сгенерированная модель представления.
		 */
		function createRowViewModel(item, onEdit, onDelete, scope, extendedMode, showCode) {
			var config = {
				values: {
					caption: item.caption || item.name,
					name: item.name || null,
					visible: true,
					allowDelete: true,
					position: item.position,
					extendedMode: extendedMode || false,
					showCode: showCode || false,
					windowViewModel: scope
				},
				methods: {
					onItemClick: onEdit,
					onItemDeleteButtonClick: onDelete,

					/**
					 * Функция получения значений имени и заголовка текущего ряда.
					 * @private
					 * @returns {Object} Объект со значениями имени и заголовка.
					 */
					getValue: function() {
						return {
							caption: this.get("caption"),
							name: this.get("name")
						};
					},

					/**
					 * Функция получения позиции текущего ряда.
					 * @private
					 * @returns {Number} Позиция текущего ряда.
					 */
					getPosition: function() {
						return this.get("position");
					},

					/**
					 * Функция получения представления ряда.
					 * @private
					 * @returns {Terrasoft.Container} Представление ряда.
					 */
					getView: function() {
						var view;
						var uid = "i-" + Terrasoft.generateGUID();
						var config = {
							id: uid + "-ItemContainer",
							selectors: {
								wrapEl: "#" + uid + "-ItemContainer"
							},
							classes: {
								wrapClassName: ["tab-item-container"]
							},
							visible: {
								bindTo: "visible"
							},
							items: [
								{
									id: uid + "-ItemLabelContainer",
									className: "Terrasoft.Container",
									selectors: {
										wrapEl: "#" + uid + "-ItemLabelContainer"
									},
									classes: {
										wrapClassName: ["tab-item-left-container"]
									},
									items: [
										{
											className: "Terrasoft.Label",
											classes: {
												labelClass: "cell-left"
											},
											caption: {
												bindTo: "caption"
											},
											click: {
												bindTo: "onItemClick"
											}
										},
										{
											className: "Terrasoft.Label",
											classes: {
												labelClass: "cell-right"
											},
											caption: {
												bindTo: "name"
											},
											visible: {
												bindTo: "showCode"
											},
											click: {
												bindTo: "onItemClick"
											}
										}
									]
								},
								{
									id: uid + "-ItemButtonsContainer",
									className: "Terrasoft.Container",
									selectors: {
										wrapEl: "#" + uid + "-ItemButtonsContainer"
									},
									classes: {
										wrapClassName: ["tab-item-right-container"]
									},
									items: [
										{
											className: "Terrasoft.Button",
											imageConfig: localizableImages.CloseIcon,
											style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
											classes: {
												wrapperClass: ["tab-delete-button", "tab-float-right"]
											},
											visible: {bindTo: "allowDelete"},
											click: {bindTo: "onItemDeleteButtonClick"}
										}
									]
								}
							],
							afterrender: {bindTo: "onVisualized"},
							afterrerender: {bindTo: "onVisualized"}
						};
						view = Ext.create("Terrasoft.Container", config);
						return view;
					},

					/**
					 * Функция отрисовки ряда.
					 * @private
					 */
					visualize: function() {
						var windowViewModel = this.get("windowViewModel");
						var tabListContainer = windowViewModel.get("tabListContainer");
						if (tabListContainer) {
							var view = this.view;
							var position = this.getPosition();
							if (!view || view.destroyed) {
								view = this.getView();
								this.view = view;
								view.bind(this);
							}
							if (view.rendered) {
								view.reRender(position, tabListContainer.getRenderToEl());
							} else {
								view.render(tabListContainer.getRenderToEl(), position);
							}
						}
					},

					/**
					 * Обработчик события отрисовки.
					 * @private
					 */
					onVisualized: function() {
						var windowViewModel = this.get("windowViewModel");
						var tabsView = windowViewModel.get("rowsView");
						var value = this.get("value");
						if (!tabsView.contains(value)) {
							tabsView.add(value, this.view);
						}
					},

					/**
					 * Обработчик события изменения позиции ряда.
					 * @private
					 */
					onPositionChanged: function(model, value) {
						var windowViewModel = this.get("windowViewModel");
						var name = this.get("name");
						var rows = windowViewModel.get("rows");
						if (rows.indexOf(this) !== value) {
							rows.remove(this);
							rows.insert(value, name, this);
						}
					}
				}
			};
			var resultViewModel = Ext.create("Terrasoft.BaseViewModel", config);
			resultViewModel.on("change:position", resultViewModel.onPositionChanged, resultViewModel);
			return resultViewModel;
		}

		/**
		 * Функция создания модели представления редактируемого ряда.
		 * @param {Object} config Конфигурационный объект редактируемого ряда.
		 * @param {Terrasoft.Container} config.renderTo Элемент контейнера.
		 * @param {Function} config.onApply Функция обратного вызова для сохранения.
		 * @param {Function} config.onPositionChanged Функция обратного вызова для изменении позиции ряда.
		 * @param {Function} config.onViewDestroyed Функция обратного вызова для удаления представления.
		 * @param {Number} config.position Позиция ряда.
		 * @param {Object} config.value Конфигурационный объект ряда.
		 * @param {Boolean} config.extendedMode Признак расширенного режима.
		 * @param {Terrasoft.BaseViewModel} config.scope Модель представления окна.
		 * @returns {Terrasoft.BaseViewModel} Сгенерированная модель представления.
		 */
		function createEditRowViewModel(config) {
			var viewModel;
			var view;
			var rowConfig = config.value || {};
			var cfg = {
				columns: {
					caption: {
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					},
					name: {
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					}
				},
				validationConfig: {
					name: [
						function(value) {
							var isEditMode = this.get("isEditMode");
							var extendedMode = this.get("extendedMode");
							if (isEditMode || !extendedMode) {
								return {invalidMessage: ""};
							}
							var result = SectionDesignerUtils.validateSystemName(value, {
								maxLength: 30
							});
							if (!result.isValid) {
								return {
									invalidMessage: result.invalidMessage
								};
							}
							var windowViewModel = this.get("windowViewModel");
							var designerViewModel = windowViewModel.get("designerViewModel");
							var schemaItem = designerViewModel.getSchemaItemInfoByName(value);
							var rows = windowViewModel.get("rows").getItems();
							var duplicateInList = false;
							Terrasoft.each(rows, function(item) {
								var name = item.values.name;
								if (name === value) {
									duplicateInList = true;
								}
							}, this);
							var invalidMessage = (!schemaItem && !duplicateInList)
								? {invalidMessage: ""}
								: {invalidMessage: localizableStrings.DuplicatedColumnNameMessage};
							return invalidMessage;
						}
					]
				},
				values: {
					view: null,
					caption: rowConfig.caption || rowConfig.name || null,
					name:  rowConfig.name || null,
					textEditFocused: false,
					isEditMode: Terrasoft.isEmptyObject(rowConfig) ? false : true,
					position: config.position,
					extendedMode: config.extendedMode || false,
					showCode: config.showCode || false,
					windowViewModel: config.scope
				},
				methods: {
					onApply: config.onApply,
					onViewDestroyed: config.onViewDestroyed,
					onPositionChanged: config.onPositionChanged,

					/**
					 * Функция получения представления редактируемого ряда.
					 * @private
					 * @returns {Terrasoft.Container} Представление редактируемого ряда.
					 */
					getView: function() {
						var view;
						var config = {
							id: "itemEditInnerContainer",
							selectors: {
								wrapEl: "#itemEditInnerContainer"
							},
							classes: {
								wrapClassName: ["tab-edit-container"]
							},
							items: [
								{
									id: "itemEditInnerElementContainer",
									className: "Terrasoft.Container",
									selectors: {
										wrapEl: "#itemEditInnerElementContainer"
									},
									classes: {
										wrapClassName: ["tab-edit"]
									},
									items: [
										{
											id: "editRow1",
											className: "Terrasoft.TextEdit",
											classes: {
												wrapClass: ["tab-edit-full"]
											},
											value: {
												bindTo: "caption"
											},
											keydown: {
												bindTo: "onKeyDown"
											},
											focused: {
												bindTo: "textEditFocused"
											},
											enabled: {
												bindTo: "extendedMode"
											},
											visible: {
												bindTo: "showCode",
												bindConfig: {
													converter: function(value) {
														return !value;
													}
												}
											}
										},
										{
											id: "editRow2",
											className: "Terrasoft.TextEdit",
											classes: {
												wrapClass: ["tab-edit-left"]
											},
											value: {
												bindTo: "caption"
											},
											keydown: {
												bindTo: "onKeyDown"
											},
											focused: {
												bindTo: "textEditFocused"
											},
											visible: {
												bindTo: "showCode"
											}
										},
										{
											className: "Terrasoft.TextEdit",
											classes: {
												wrapClass: ["tab-edit-right"]
											},
											value: {
												bindTo: "name"
											},
											keydown: {
												bindTo: "onKeyDown"
											},
											visible: {
												bindTo: "showCode"
											},
											enabled: {
												bindTo: "isEditMode",
												bindConfig: {
													converter: function(value) {
														return !value;
													}
												}
											}
										}
									]
								},
								{
									id: "itemEditInnerButtonsContainer",
									className: "Terrasoft.Container",
									selectors: {
										wrapEl: "#itemEditInnerButtonsContainer"
									},
									classes: {
										wrapClassName: ["tab-buttons"]
									},
									items: [
										{
											className: "Terrasoft.Button",
											style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
											classes: {
												textClass: ["page-type-button", "page-type-padding-left-0px"]
											},
											caption: localizableStrings.SaveButtonCaption,
											click: {
												bindTo: "onItemEditApplyButtonClick"
											}
										},
										{
											className: "Terrasoft.Button",
											caption: localizableStrings.CancelButtonCaption,
											style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
											classes: {
												textClass: ["page-type-button"]
											},
											click: {
												bindTo: "onItemEditCancelButtonClick"
											}
										},
										{
											className: "Terrasoft.Button",
											caption: localizableStrings.DownButtonCaption,
											style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
											classes: {
												textClass: [
													"page-type-button",
													"page-type-float-right",
													"page-type-padding-right-0px"
												]
											},
											click: {
												bindTo: "onItemEditDownButtonClick"
											},
											enabled: {
												bindTo: "isItemEditDownButtonEnabled"
											}
										},
										{
											className: "Terrasoft.Button",
											caption: localizableStrings.UpButtonCaption,
											style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
											classes: {
												textClass: ["page-type-button", "page-type-float-right"]
											},
											click: {
												bindTo: "onItemEditUpButtonClick"
											},
											enabled: {
												bindTo: "isItemEditUpButtonEnabled"
											}
										}
									]
								}
							],
							destroy: {
								bindTo: "internalOnViewDestroyed"
							},
							afterrender: {
								bindTo: "onViewRendered"
							}
						};
						view = Ext.create("Terrasoft.Container", config);
						return view;
					},

					/**
					 * Обработчик события нажатия на кнопку отмены редактирования.
					 * @private
					 */
					onItemEditCancelButtonClick: function() {
						this.get("view").destroy();
						ModalBox.updateSizeByContent();
					},

					/**
					 * Обработчик события уничтожения представления.
					 * @private
					 */
					internalOnViewDestroyed: function() {
						if (this.onViewDestroyed) {
							this.onViewDestroyed();
						}
					},

					/**
					 * Обработчик события нажатия на кнопку сохранения редактирования ряда.
					 * @private
					 */
					onItemEditApplyButtonClick: function() {
						var caption = this.get("caption");
						var name = this.get("name");
						if (this.validate()) {
							if (this.onApply) {
								this.onApply({
									caption: caption,
									name: name
								});
							}
							this.onItemEditCancelButtonClick();
							ModalBox.updateSizeByContent();
						}
					},

					/**
					 * Обработчик события сгенерированного представления.
					 * @private
					 */
					onViewRendered: function() {
						this.set("textEditFocused", true);
						var isEditMode = this.get("isEditMode");
						if (!isEditMode) {
							var windowViewModel = this.get("windowViewModel");
							var currentObjectName = windowViewModel.get("currentObjectName");
							var index = windowViewModel.get("rows").getCount() + 1;
							var generatedName = currentObjectName + index + "Tab";
							this.set("name", generatedName);
						}
					},

					/**
					 * Обработчик события нажатия кнопок влавиатуры.
					 * @private
					 */
					onKeyDown: function(e) {
						var key = e.getKey();
						switch (key) {
							case e.ESC:
								this.onItemEditCancelButtonClick();
								break;
							case e.ENTER:
								this.onItemEditApplyButtonClick();
								break;
							default:
								break;
						}
					},

					/**
					 * Обработчик события нажатия на кнопку "вверх".
					 * @private
					 */
					onItemEditUpButtonClick: function() {
						var position = this.get("position") - 1;
						this.changePosition(position);
					},

					/**
					 * Обработчик события нажатия на кнопку "вниз".
					 * @private
					 */
					onItemEditDownButtonClick: function() {
						var position = this.get("position") + 1;
						this.changePosition(position);
					},

					/**
					 * Обработчик события изменения позиции.
					 * @private
					 */
					changePosition: function(position) {
						this.set("position", position);
						this.get("view").reRender(position);
					},

					/**
					 * Функция определяющая включена ли кнопка "вверх".
					 * @private
					 * @returns {Boolean} Включена ли кнопка.
					 */
					isItemEditUpButtonEnabled: function() {
						return this.get("position") > 0;
					},

					/**
					 * Функция определяющая включена ли кнопка "вниз".
					 * @private
					 * @returns {Boolean} Включена ли кнопка.
					 */
					isItemEditDownButtonEnabled: function() {
						var windowViewModel = this.get("windowViewModel");
						var rows = windowViewModel.get("rows");
						return this.get("position") + 1 < rows.getCount();
					}
				}
			};
			viewModel = Ext.create("Terrasoft.BaseViewModel", cfg);
			view = viewModel.getView();
			view.bind(viewModel);
			view.render(config.renderTo, config.position);
			viewModel.set("view", view);
			return viewModel;
		}

		/**
		 * Функция создания модели представления окна добавления или редактирования вкладок.
		 * @param {Array} tabsConf Массив закладок.
		 * @param {Boolean} extendedMode Признак расширенного режима.
		 * @param {Boolean} showCode Признак отображения колонки "код".
		 * @param {Object} addConfig Конфигурационный объект.
		 * @param {String} addConfig.tabCaption Заголовок текущей вкладки.
		 * @param {String} addConfig.currentObjectName Имя текущего объекта.
		 * @returns {Terrasoft.BaseViewModel} Сгенерированная модель представления.
		 */
		function createTabsWindowViewModel(tabsConf, extendedMode, showCode, addConfig) {
			var viewModel;
			var tabCaption;
			var currentObjectName;
			if (addConfig) {
				tabCaption = addConfig.tabCaption;
				currentObjectName = addConfig.currentObjectName;
			}
			var cfg = {
				values: {
					headerCaption: tabCaption || localizableStrings.TabsHeaderCaption,
					rows: new Terrasoft.Collection(),
					rowsView: new Terrasoft.Collection(),
					editRowViewModel: null,
					addItemContainer: null,
					tabListContainer: null,
					currentObjectName: currentObjectName || null,
					extendedMode: extendedMode || false,
					showCode: showCode || false,
					activePosition: null
				},
				methods: {
					/**
					 * Функция заполнения коллекции данных.
					 * @private
					 */
					fillRowsCollection: function() {
						var rows = this.get("rows");
						Terrasoft.each(tabsConf, function(item) {
							var tabViewModel = this.getRowViewModel(item);
							rows.add(item.name, tabViewModel);
						}, this);
					},

					/**
					 * Обработчик события нажатия на кнопку добавления.
					 * @private
					 */
					onAddItemButtonClick: function() {
						if (this.get("editRowViewModel")) {
							var vm = this.get("editRowViewModel");
							vm.get("view").destroy();
						}
						var extendedMode = this.get("extendedMode");
						var showCode = this.get("showCode");
						var addItemContainer = this.get("addItemContainer");
						this.set("editRowViewModel",
							createEditRowViewModel({
								renderTo: addItemContainer.getRenderToEl(),
								onApply: this.onAddItemApplyButtonClick,
								extendedMode: extendedMode,
								showCode: showCode,
								scope: this
							})
						);
						ModalBox.updateSizeByContent();
					},

					/**
					 * Функция установки контейнера добавления элемента.
					 * @private
					 */
					setAddItemContainer: function() {
						this.set("addItemContainer",  Ext.getCmp("addItemContainer"));
					},

					/**
					 * Функция очистки контейнера добавления элемента.
					 * @private
					 */
					clearAddItemContainer: function() {
						this.set("addItemContainer", null);
					},

					/**
					 * Функция установки контейнера списка элемента.
					 * @private
					 */
					setTabListContainer: function() {
						this.set("tabListContainer", Ext.getCmp("tabListContainer"));
						var rows = this.get("rows");
						rows.each(function(row) {
							row.visualize();
						});
					},

					/**
					 * Функция очистки контейнера списка элемента.
					 * @private
					 */
					clearTabListContainer: function() {
						this.set("tabListContainer", null);
					},

					/**
					 * Получение модели представления ряда.
					 * @private
					 * @param {Object} value Значение ряда.
					 */
					getRowViewModel: function(value) {
						var onEditApply = function(item) {
							rowViewModel.set("caption", item.caption);
							rowViewModel.set("name", item.name);
							rowViewModel.set("position", this.get("position"));
							ModalBox.updateSizeByContent();
						};
						var onViewDestroyed = function() {
							rowViewModel.set("visible", true);
							rowViewModel.visualize();
						};
						var onPositionChanged = function(item) {
							rowViewModel.set("position", item.position);
						};
						var onEdit = function() {
							this.view.destroy();
							var windowViewModel = this.get("windowViewModel");
							var rows = windowViewModel.get("rows");
							var currentPosition = rows.indexOf(this);
							this.set("position", currentPosition);
							var value = this.getValue();
							var renderPosition = this.getPosition();
							var extendedMode = windowViewModel.get("extendedMode");
							var showCode =  windowViewModel.get("showCode");
							var tabListContainer = windowViewModel.get("tabListContainer");
							var prevVm = windowViewModel.get("editRowViewModel");
							if (prevVm) {
								prevVm.get("view").destroy();
							}
							windowViewModel.set("editRowViewModel",
								createEditRowViewModel({
									renderTo: tabListContainer.getRenderToEl(),
									onApply: onEditApply,
									onPositionChanged: onPositionChanged,
									onViewDestroyed: onViewDestroyed,
									position: renderPosition,
									value: value,
									extendedMode: extendedMode,
									showCode: showCode,
									scope: windowViewModel
								})
							);
							ModalBox.updateSizeByContent();
						};
						var onDelete = function() {
							var windowViewModel = this.get("windowViewModel");
							windowViewModel.get("rows").remove(this);
							ModalBox.updateSizeByContent();
						};
						var extendedMode = this.get("extendedMode");
						var showCode = this.get("showCode");
						var rowViewModel = createRowViewModel(value, onEdit, onDelete, this, extendedMode, showCode);
						return rowViewModel;
					},

					/**
					 * Обработчик события нажатия на кнопку сохранения редактирования ряда.
					 * @private
					 * @param {Object} value Значение ряда.
					 */
					onAddItemApplyButtonClick: function(value) {
						var windowViewModel = this.get("windowViewModel");
						var rows = windowViewModel.get("rows");
						if (!rows.contains(value.name)) {
							value.position = rows.getCount();
							var rowViewModel = windowViewModel.getRowViewModel(value);
							rows.add(value.name, rowViewModel);
							return true;
						}
						return false;
					},

					/**
					 * Подписывает на события.
					 * @private
					 */
					subscribeEvents: function() {
						var rows = this.get("rows");
						var rowsView = this.get("rowsView");
						var onTabAdded = function(row) {
							row.visualize();
						};
						rows.on("add", onTabAdded);
						rows.on("remove", function(row) {
							if (!row.view.destroyed) {
								row.view.destroy();
							}
							delete row.view;
							rowsView.remove(row.view);

						});
						rows.on("clear", function() {
							rowsView.each(function(view) {
								view.destroy();
							});
							rowsView.clear();
						});
						rows.on("clear", function() {
							rows.each(onTabAdded);
						});
						this.on("change:showCode", function() {
							var showCode = this.get("showCode");
							var rowsView = this.get("rowsView");
							var rows = this.get("rows");
							rowsView.each(function(view) {
								view.destroy();
							});
							rowsView.clear();
							rows.each(function(row) {
								row.set("showCode", showCode);
								row.visualize();
							});
							var editViewModel = this.get("editRowViewModel");
							if (editViewModel) {
								editViewModel.set("showCode", showCode);
							}
						});
					},

					onSaved: Ext.emptyFn,

					/**
					 * Обработчик события нажатия на кнопку сохранения.
					 * @private
					 */
					onSaveClick: function() {
						var validation = this.validate();
						if (!validation) {
							return;
						}
						var rowItems = this.get("rows").getItems();
						var result = [];
						Terrasoft.each(rowItems, function(row, key) {
							var position = parseInt(key, 10);
							var item = {
								name: row.get("name") || null,
								caption: row.get("caption"),
								position: position
							};
							result.push(item);
						});
						this.onSaved(result);
						ModalBox.close();
					},

					/**
					 * Обработчик события нажатия на кнопку отмены
					 * @private
					 */
					onCancelClick: function() {
						ModalBox.close();
					},
					/**
					 * Изменяет свойство видимости поля код на противоположный
					 * @private
					 */
					toggleCodeVisibility: function() {
						var showCode = this.get("showCode");
						this.set("showCode", !showCode);
					},

					/**
					 * Устанавливает заголовок кнопки переключения видимости колонки код.
					 * @private
					 */
					setButtonCaption: function() {
						var caption;
						var showCode = this.get("showCode");
						if (showCode) {
							caption = localizableStrings.HideCodeButtonCaption;
						} else {
							caption = localizableStrings.ShowCodeButtonCaption;
						}
						return caption;
					}
				}
			};
			viewModel = Ext.create("Terrasoft.BaseViewModel", cfg);
			viewModel.subscribeEvents();
			viewModel.fillRowsCollection();
			return viewModel;
		}

		/**
		 * Функция создания представления окна редактирования вкладок.
		 * @returns {Terrasoft.Container} Сгенерированое представление окна.
		 */
		function createTabsWindowView() {
			var view;
			var headerContainer = createHeaderContainer();
			headerContainer.add({
				className: "Terrasoft.Button",
				id: "toggleCodeVisibilityButton",
				selectors: {
					wrapEl: "#toggleCodeVisibilityButton"
				},
				caption: {
					bindTo: "setButtonCaption"
				},
				classes: {
					textClass: ["toggleButton"]
				},
				tag: "toggleCodeVisibility",
				visible: {
					bindTo: "extendedMode"
				},
				click: {
					bindTo: "toggleCodeVisibility"
				}
			});
			var cfg = {
				className: "Terrasoft.Container",
				id: "tabsMainContainer",
				selectors: {
					el: "#tabsMainContainer",
					wrapEl: "#tabsMainContainer"
				},
				classes: {
					wrapClassName: ["mainContainer"]
				},
				items: [
					headerContainer,
					{
						className: "Terrasoft.Container",
						id: "contentContainer",
						selectors: {
							wrapEl: "#contentContainer"
						},
						classes: {
							wrapClassName: ["contentContainer"]
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "captionRowContainer",
								selectors: {
									wrapEl: "#captionRowContainer"
								},
								classes: {
									wrapClassName: ["caption-row-container"]
								},
								items: [
									{
										className: "Terrasoft.Label",
										classes: {
											labelClass: ["caption-row-left"]
										},
										caption: localizableStrings.TitleCaption
									},
									{
										className: "Terrasoft.Label",
										classes: {
											labelClass: ["caption-row-right"]
										},
										visible: {
											bindTo: "showCode"
										},
										caption: localizableStrings.CodeCaption
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "tabListContainer",
								selectors: {
									wrapEl: "#tabListContainer"
								},
								afterrender: {
									bindTo: "setTabListContainer"
								},
								destroy: {
									bindTo: "clearTabListContainer"
								},
								items: []
							},
							{
								className: "Terrasoft.Container",
								id: "addItemContainer",
								selectors: {
									wrapEl: "#addItemContainer"
								},
								afterrender: {
									bindTo: "setAddItemContainer"
								},
								destroy: {
									bindTo: "clearAddItemContainer"
								},
								items: []
							},
							{
								className: "Terrasoft.Container",
								id: "addButtonContainer",
								selectors: {
									wrapEl: "#addButtonContainer"
								},
								classes: {
									wrapClassName: ["addButtonContainer"]
								},
								visible: {
									bindTo: "extendedMode"
								},
								items: [
									{
										className: "Terrasoft.Button",
										caption: localizableStrings.AddButtonCaption,
										click: {
											bindTo: "onAddItemButtonClick"
										},
										classes: {
											wrapperClass: ["tab-add-button"]
										}
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "footer",
								selectors: {
									wrapEl: "#footer"
								},
								classes: {
									wrapClassName: ["footer"]
								}
							}
						]
					}
				]
			};
			view = Ext.create("Terrasoft.Container", cfg);
			return view;
		}

		/**
		 * Функция создания модального окна редактирования вкладок.
		 * @param {Terrasoft.BaseViewModel} scope Модель представления дизайнера страницы.
		 * @param {Array} tabsConf Массив закладок.
		 * @param {Object} addConfig Конфигурационный объект.
		 * @param {String} addConfig.currentObjectName Имя текущего объекта.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function showEditTabsWindow(scope, tabsConf, addConfig, callback) {
			var extendedMode = true;
			var showCode = false;
			var vm = createTabsWindowViewModel(tabsConf, extendedMode, showCode, addConfig);
			vm.set("designerViewModel", scope);
			vm.onSaved = function(tabs) {
				callback.call(scope, tabs);
			};
			var view = createTabsWindowView(extendedMode);
			var modalBoxConfig = {};
			modalBoxConfig.container = ModalBox.show({
				minWidth: 1,
				maxWidth: 99,
				minHeight: 1,
				maxHeight: 99
			});
			view.bind(vm);
			view.render(modalBoxConfig.container);
			ModalBox.updateSizeByContent();
		}

		/**
		 * Функция создания модального окна редактирования текущей вкладки.
		 * @param {Terrasoft.BaseViewModel} scope Модель представления дизайнера страницы.
		 * @param {Array} itemsConf Массив элементов закладки.
		 * @param {Object} addConf Конфигурационный объект.
		 * @param {String} addConf.tabCaption Заголовок текущей вкладки.
		 * @param {Function} callback Функция обратного вызова.
		 */
		function showEditTabItemsWindow(scope, itemsConf, addConf, callback) {
			var extendedMode = false;
			var showCode = false;
			var vm = createTabsWindowViewModel(itemsConf, extendedMode, showCode, addConf);
			vm.onSaved = function(items) {
				callback.call(scope, items);
			};
			var view = createTabsWindowView(extendedMode);
			var modalBoxConfig = {};
			modalBoxConfig.container = ModalBox.show({
				minWidth: 1,
				maxWidth: 99,
				minHeight: 1,
				maxHeight: 99
			});
			view.bind(vm);
			view.render(modalBoxConfig.container);
			ModalBox.updateSizeByContent();
		}

		function initializeGridLayoutDragAndDrop(callback) {
			var elementsList = Ext.select(".grid-layout .item-cell > .dragdrop-element", false);

			var elements = [];
			for (var i = 0, ii = elementsList.elements.length; i < ii; i++) {
				var element = elementsList.elements[i];
				elements.push(Ext.get(element));
			}
			var targetsList = Ext.select(".grid-layout .empty-element-class, .grid-layout .add-button", false);
			var targets = [];
			for (var j = 0, jj = targetsList.elements.length; j < jj; j++) {
				var target = targetsList.elements[j];
				targets.push(Ext.get(target));
			}
			Ext.create("Terrasoft.DragDropHelper", {
				elements: elements,
				targets: targets,
				listeners: {
					dragdrop: function(targetElement, element) {
						var itemColumnEl = targetElement.parent();
						var newRow = parseInt(itemColumnEl.getAttribute("data-row"), 10);
						var newColumn = parseInt(itemColumnEl.getAttribute("data-column"), 10);
						var gridLayoutEl = itemColumnEl.parent(".grid-layout");
						var newGridLayout = Ext.getCmp(gridLayoutEl.id);
						var itemContainer = Ext.getCmp(element.id);
						var item = itemContainer.items.getAt(0);
						if (item) {
							callback.call(this, newGridLayout.tag, item.tag, newRow, newColumn);
						}
					}
				}
			});
		}

		return {
			showNewColumnWindow: showNewColumnWindow,
			showExistingColumnWindow: showExistingColumnWindow,
			showEditGroupWindow: showEditGroupWindow,
			showEditDetailWindow: showEditDetailWindow,
			showEditTabsWindow: showEditTabsWindow,
			showEditTabItemsWindow: showEditTabItemsWindow,
			initializeGridLayoutDragAndDrop: initializeGridLayoutDragAndDrop,
			getFillingGridMatrix: getFillingGridMatrix,
			generateEntityColumnByDataValueType: generateEntityColumnByDataValueType,
			getSchemaItemInfoByName: getSchemaItemInfoByName,
			getDetailsInfo: getDetailsInfo,
			setDataValueTypesStorage: setDataValueTypesStorage,
			getRequireFieldNotInSchema: getRequireFieldNotInSchema
		};
	});
