define("EditedRowViewModelUtilities", ["ext-base", "terrasoft", "EditedRowViewModelUtilitiesResources", "ModalBox"],
	function(Ext, Terrasoft, resources, ModalBox) {
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
							return !schemaItem && !duplicateInList ?
							{invalidMessage: ""}:
							{invalidMessage: localizableStrings.DuplicatedColumnNameMessage};
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
					 * Функция получения представления редактируемого ряда
					 * @private
					 * @returns {Terrasoft.Container} Представление редактируемого ряда
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
					 * Обработчик события нажатия на кнопку отмены редактирования
					 * @private
					 */
					onItemEditCancelButtonClick: function() {
						this.get("view").destroy();
						ModalBox.updateSizeByContent();
					},

					/**
					 * Обработчик события уничтожения представления
					 * @private
					 */
					internalOnViewDestroyed: function() {
						if (this.onViewDestroyed) {
							this.onViewDestroyed();
						}
					},

					/**
					 * Обработчик события нажатия на кнопку сохранения редактирования ряда
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
					 * Обработчик события сгенерированного представления
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
					 * Обработчик события нажатия кнопок влавиатуры
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
					 * Обработчик события нажатия на кнопку "вверх"
					 * @private
					 */
					onItemEditUpButtonClick: function() {
						var position = this.get("position") - 1;
						this.changePosition(position);
					},

					/**
					 * Обработчик события нажатия на кнопку "вниз"
					 * @private
					 */
					onItemEditDownButtonClick: function() {
						var position = this.get("position") + 1;
						this.changePosition(position);
					},

					/**
					 * Обработчик события изменения позиции
					 * @private
					 */
					changePosition: function(position) {
						this.set("position", position);
						this.get("view").reRender(position);
					},

					/**
					 * Функция определяющая включена ли кнопка "вверх"
					 * @private
					 * @returns {Boolean} Включена ли кнопка
					 */
					isItemEditUpButtonEnabled: function() {
						return this.get("position") > 0;
					},

					/**
					 * Функция определяющая включена ли кнопка "вниз"
					 * @private
					 * @returns {Boolean} Включена ли кнопка
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

		return {
			createEditRowViewModel: createEditRowViewModel
		};
	});