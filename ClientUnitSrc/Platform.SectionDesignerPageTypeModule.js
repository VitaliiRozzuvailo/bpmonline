define("SectionDesignerPageTypeModule", [
	"ext-base", "terrasoft", "sandbox", "SectionDesignerPageTypeModuleResources",
	"SectionDesignerUtils", "SectionDesignDataModule", "ConfigurationEnums"
],
	function(Ext, Terrasoft, sandbox, resources, SectionDesignerUtils, SectionDesignDataModule, ConfigurationEnums) {

		/**
		 * Локализированные строки ресурсов
		 * @private
		 * @type {Object}
		 */
		var localizableStrings = resources.localizableStrings;

		/**
		 * Модель отображения модуля типов страниц редактирования
		 * @private
		 * @type {Terrasoft.BaseViewModel}
		 */
		var viewModel;

		/**
		 * Колонки EntitySchema, которые могут быть колонкой типа
		 * @private
		 * @type {Terrasoft.Collection}
		 */
		var availableEntityTypeColumns = Ext.create("Terrasoft.Collection");

		/**
		 * Имя контейнера, в который будут помещаться элементы управления, для отображения типов страниц редактирования
		 * @private
		 * @type {String}
		 */
		var pagesTypeContainerName = "pagesTypeContainer";

		/**
		 * Контейнер, в который будут помещаться элементы управления для отображения типов страниц редактирования
		 * @type {Object}
		 */
		var pagesTypeContainer;

		/**
		 * Имя контейнера, в который будут помещаться элементы управления для добавления нового типа страницы
		 * редактирования записи
		 * @private
		 * @type {string}
		 */
		var addItemContainerName = "addItemContainer";

		/**
		 * Контейнер, в который будет рендетиться блок элементов управления для добавления нового типа страницы
		 * @private
		 * @type {Object}
		 */
		var addItemContainer;

		/**
		 * Модель отображения блока элементов управления для редактирования типа страницы
		 * @type {Object}
		 */
		var itemEditViewModel;

		/**
		 * Возвращает объект с перечнем колонок, которые могут быть использованы в качестве колонки с типом записи
		 * @param {Object} entitySchema схема объекта
		 * @returns {Object} доступные колонки объекта
		 */
		function getAvailableEntityTypeColumns(entitySchema) {
			var columns = Ext.create("Terrasoft.Collection");
			Terrasoft.each(entitySchema.columns, function(column, columnName) {
				if (column.dataValueType !== Terrasoft.DataValueType.LOOKUP ||
					column.usageType !== ConfigurationEnums.EntitySchemaColumnUsageType.General) {
					return;
				}
				columns.add(column.uId, {
					uId: column.uId,
					value: columnName,
					displayValue: column.caption,
					referenceSchemaName: column.referenceSchemaName
				});
			}, this);
			return columns;
		}

		/**
		 * Валидатор дублирующихся имен типов
		 * @param {String} displayValue Название типа
		 * @returns {{invalidMessage: string, isValid: boolean}}
		 */
		function validateDuplicatedTypeName(displayValue) {
			var result = {
				invalidMessage: "",
				isValid: true
			};
			var value = this.get("value");
			var pages = viewModel.get("pages");
			pages.each(function(page) {
				if (page.get("displayValue") === displayValue && page.get("value") !== value) {
					result.invalidMessage = localizableStrings.DuplicatedTypeNames;
					result.isValid = false;
					return false;
				}
			});
			return result;
		}

		/**
		 * Возвращает отображение модуля редактирования типов страниц
		 * @returns {Terrasoft.Container}
		 */
		function getView() {
			function getContainer(id, wrapClasses, items) {
				return {
					className: "Terrasoft.Container",
					id: id + "Container",
					selectors: {wrapEl: "#" + id + "Container"},
					classes: {wrapClassName: wrapClasses},
					items: items
				};
			}
			var config = {
				id: "section-designer-page-types-module-container",
				selectors: {
					wrapEl: "#section-designer-page-types-module-container"
				},
				visible: {
					bindTo: "visible"
				},
				items: [
					getContainer("type", ["control-width-15", "control-left", "control-right"], [
						getContainer("typeLabel", ["label-wrap", "page-type-hint"], [{
							className: "Terrasoft.Label",
							caption: localizableStrings.TypeColumnCaption,
							classes: {
								labelClass: ["required-caption"]
							}
						}]),
						getContainer("typeControl", ["control-wrap", "page-type-control"], [{
							className: "Terrasoft.ComboBoxEdit",
							value: {bindTo: "typeColumn"},
							list: {bindTo: "typeColumnList"},
							prepareList: {bindTo: "prepareTypeColumnList"},
							enabled: {bindTo: "canEditTypeColumn"}
						}])
					]),
					{
						className: "Terrasoft.Container",
						id: "section-designer-page-types-edit-container",
						selectors: {
							wrapEl: "#section-designer-page-types-edit-container"
						},
						classes: {wrapClassName: ["page-type-container"]},
						visible: {
							bindTo: "typeColumn",
							bindConfig: {
								converter: function(x) {
									return !!x;
								}
							}
						},
						items: [
							{
								className: "Terrasoft.ControlGroup",
								id: pagesTypeContainerName,
								selectors: {
									wrapEl: "#" + pagesTypeContainerName
								},
								afterrender: {bindTo: "setPagesTypeContainer"},
								afterrerender: {bindTo: "setPagesTypeContainer"},
								destroy: {bindTo: "clearPagesTypeContainer"},
								collapsed: {bindTo: "isGroupCollapsed"},
								wrapClass: "page-type-group",
								caption: localizableStrings.RecordsTypeCaption,
								items: [],
								tools: [{
									className: "Terrasoft.Button",
									caption: localizableStrings.AddButtonCaption,
									style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
									visible: {
										bindTo: "isGroupCollapsed",
										bindConfig: {
											converter: function(x) {
												return !x;
											}
										}
									},
									click: {bindTo: "onAddItemButtonClick"},
									markerValue: "addNewType",
									classes: {
										wrapperClass: ["page-type-add-button"]
									},
									menu: {
										items: {bindTo: "addButtonMenuItemsCollection"}
									}
								}]
							},
							{
								className: "Terrasoft.Container",
								id: addItemContainerName,
								selectors: {
									wrapEl: "#" + addItemContainerName
								},
								classes: {
									wrapClassName: ["page-type-add-container"]
								},
								afterrender: {
									bindTo: "setAddItemContainer"
								},
								afterrerender: {
									bindTo: "setAddItemContainer"
								},
								destroy: {
									bindTo: "clearAddItemContainer"
								},
								items: [
								]
							}
						]
					}
				]
			};
			var view = Ext.create("Terrasoft.Container", config);
			return view;
		}

		/**
		 * Возвращает модель отображения модуля редактирования типов страниц
		 * @returns (Terrasoft.BaseViewModel)
		 */
		function getViewModel() {
			var config = {
				columns: {
					typeColumn: {
						dataValueType: Terrasoft.DataValueType.ENUM,
						isRequired: true,
						name: "typeColumn"
					},
					pages: {
						dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
						name: "pages"
					}
				},
				values: {
					pages: new Terrasoft.Collection(),
					pagesView: new Terrasoft.Collection(),
					typeColumnList: new Terrasoft.Collection(),
					addButtonMenuItemsCollection: new Terrasoft.Collection(),
					addButtonMenuFirstItem: Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Id: "addNewItem",
							Caption: localizableStrings.AddNewMenuItemCaption,
							Click: {
								bindTo: "onAddItemButtonClick"
							},
							markerValue: "addNewType",
							Tag: "addNewItem"
						}
					}),
					addButtonMenuSeparator: Ext.create("Terrasoft.BaseViewModel", {
						values: {
							Id: "separator",
							Type: "Terrasoft.MenuSeparator",
							Caption: localizableStrings.ExistingRecordsSeparatorCaption
						}
					}),
					isGroupCollapsed: false,
					currentTypeColumn: null,
					typeColumn: null,
					visible: false,
					canEditTypeColumn: true
				},
				methods: {
					onAddItemButtonClick: function(tag) {
						var menuItemsCollection = this.get("addButtonMenuItemsCollection");
						if (!tag && menuItemsCollection.getCount() > 0) {
							return false;
						}
						var typeColumn = this.get("typeColumn");
						SectionDesignDataModule.getEntitySchemaByName({
							name: typeColumn.referenceSchemaName,
							scope: this,
							callback: function(entitySchema) {
								var allowAdd = true;
								Terrasoft.each(entitySchema.columns, function(column) {
									if (column.isRequired && column.name !== entitySchema.primaryDisplayColumnName &&
										column.name !== entitySchema.primaryColumnName) {
										allowAdd = false;
										return false;
									}
								});
								if (allowAdd) {
									addItemEdit({
										renderTo: addItemContainer.getRenderToEl(),
										onApply: this.onAddItemApplyButtonClick
									});
								} else {
									this.showInformationDialog(Ext.String.format(localizableStrings.CanNotAddNewMessage,
										entitySchema.caption));
								}
							}
						});
					},

					setAddItemContainer: function() {
						addItemContainer = Ext.getCmp(addItemContainerName);
					},
					clearAddItemContainer: function() {
						addItemContainer = null;
					},
					setPagesTypeContainer: function() {
						pagesTypeContainer = Ext.getCmp(pagesTypeContainerName);
						var pages = this.get("pages");
						pages.each(function(page) {
							page.visualize();
						});
					},
					clearPagesTypeContainer: function() {
						pagesTypeContainer = null;
					},
					createPageViewModel: function(pages, value) {
						var onEditApply = function(item) {
							pageViewModel.set("displayValue", item.displayValue);
						};
						var onViewDestroyed = function() {
//							var value = pageViewModel.get("value");
//							pages.add(value.value, pageViewModel);
							pageViewModel.set("visible", true);
							pageViewModel.visualize();
						};
						var onEdit = function() {
//							pages.remove(this);
							this.set("visible", false);
							this.view.destroy();
							var value = this.getValue();
							var renderPosition = this.getPosition(); //pages.indexOf(this);
							addItemEdit({
								renderTo: pagesTypeContainer.getRenderToEl(),
								onApply: onEditApply,
								onPositionChanged: onPositionChanged,
								onViewDestroyed: onViewDestroyed,
								position: renderPosition,
								value: value
							});
						};
						var onPositionChanged = function(item) {
//							pages.each(function(pageItem) {
//								var position = pageItem.get("position");
//								if (position === item.position) {
//									pageItem.set("position", item.oldPosition);
//									return false;
//								}
//							});
							pageViewModel.set("position", item.position);
						};
						var onDelete = function() {
							SectionDesignDataModule.getDesignData(function(data) {
//								var itemPosition = scope.get("position");
//								pages.each(function(pageItem) {
//									var pagePosition = pageItem.get("position");
//									if (pagePosition > itemPosition) {
//										pageItem.set("position", pagePosition - 1);
//									}
//								});
								pages.remove(this);
								SectionDesignerUtils.removeEditPage(data, this.get("value"));
								viewModel.actualizePagePositions(pages, data);
								var typeColumn = viewModel.get("currentTypeColumn");
								SectionDesignDataModule.getEntities(typeColumn.referenceSchemaName, ["Name"], false,
									function(entitySchemaData) {
										viewModel.addNotExistedTypesMenuItems(pages, entitySchemaData);
										delete data.schemaManager;
										setDesignData(data);
										sandbox.publish("RefreshPagesConfig");
									});
							}, this);
						};
						var pageViewModel = getPageViewModel(value, onEdit, onDelete);
						return pageViewModel;
					},
					onAddItemApplyButtonClick: function(value) {
						var pages = viewModel.get("pages");
						if (!pages.contains(value.value)) {
							value.position = pages.getCount();
							var pageViewModel = viewModel.createPageViewModel(pages, value);
							pages.add(value.value, pageViewModel);
							var typeColumn = viewModel.get("currentTypeColumn");
							var primaryValue = value.value;
							var primaryDisplayValue = value.displayValue;
							SectionDesignDataModule.getEntityById(typeColumn.referenceSchemaName, primaryValue, ["Id"],
									true, function(entity) {
								if (!entity) {
									SectionDesignDataModule.addEntity(typeColumn.referenceSchemaName, {
										Id: primaryValue,
										Name: primaryDisplayValue
									});
								}
							});
							SectionDesignDataModule.getDesignData(function(data) {
								SectionDesignerUtils.addTypedEditPage(data, primaryValue, primaryDisplayValue,
										value.position, typeColumn.referenceSchemaName, function(modifiedData) {
									setDesignData(modifiedData);
									sandbox.publish("RefreshPagesConfig");
								});
							});
							return true;
						}
						return false;
					},
					onMenuItemClick: function(tag) {
						var menuItemsCollection = this.get("addButtonMenuItemsCollection");
						var item = menuItemsCollection.get(tag);
						this.onAddItemApplyButtonClick({
							value: item.get("Id"),
							displayValue: item.get("Name")
						});
						menuItemsCollection.remove(item);
					},
					actualizePagePositions: function(pages, designData) {
						pages.each(function(page) {
							var pageIndex = pages.indexOf(page);
							var position = page.get("position");
							if (pageIndex !== position) {
								page.set("position", pageIndex, {silent: true});
								page.onItemValueChanged(designData);
							}
						});
					},
					subscribeEvents: function() {
						var pages = this.get("pages");
						var pagesView = this.get("pagesView");
						var addButtonMenuItemsCollection = this.get("addButtonMenuItemsCollection");
						var onPageAdded = function(page) {
							page.visualize();
						};
						pages.on("add", onPageAdded);
						pages.on("remove", function(page) {
							if (!page.view.destroyed) {
								page.view.destroy();
							}
							pagesView.remove(page.view);
							delete page.view;
						});
						pages.on("clear", function() {
							pagesView.each(function(view) {
								view.destroy();
							});
							pagesView.clear();
						});
//						pages.on("clear", function() {
//							pages.each(onPageAdded);
//						});
						this.on("change:typeColumn", this.onTypeColumnChanged, this);
						this.on("change:currentTypeColumn", function(bbModel, value) {
							this.changeSectionTypeColumn(value);
						}, this);
						addButtonMenuItemsCollection.on("add", function() {
							if (this.getCount() === 1) {
								this.add(viewModel.get("addButtonMenuFirstItem"));
								this.add(viewModel.get("addButtonMenuSeparator"));
							}
						}, addButtonMenuItemsCollection);
						addButtonMenuItemsCollection.on("remove", function() {
							if (this.getCount() <= 2) {
								this.removeByIndex(0);
							}
						}, addButtonMenuItemsCollection);
					},
					prepareTypeColumnList: function(filter, list) {
						list.clear();
						list.loadAll(availableEntityTypeColumns);
					},
					onTypeColumnChanged: function(bbModel, value) {
						var currentTypeColumn = this.get("currentTypeColumn");
						if (value !== currentTypeColumn) {
							if (currentTypeColumn && !viewModel.initialization && !viewModel.silentMode) {
								this.showInformationDialog(localizableStrings.OnChangeTypeColumnMessage,
									function(buttonCode) {
										if (buttonCode === "cancel") {
											this.set("typeColumn", currentTypeColumn);
										} else {
											this.set("currentTypeColumn", value);
										}
									}, {buttons: ["ok", "cancel"]});
							} else {
								this.set("currentTypeColumn", value);
							}
						}
					},
					changeSectionTypeColumn: function(column) {
						if (this.initialization || viewModel.silentMode) {
							this.reloadPages(column);
						} else {
							SectionDesignDataModule.getDesignData(function(data) {
								SectionDesignerUtils.changeSectionTypeColumn(data, column);
								setDesignData(data);
								viewModel.reloadPages(column);
							});
						}
					},
					addNotExistedTypesMenuItems: function(pages, entitySchemaData) {
						var menuItemsCollection = this.get("addButtonMenuItemsCollection");
						menuItemsCollection.clear();
						Terrasoft.each(entitySchemaData, function(item) {
							if (!pages.contains(item.Id) && !menuItemsCollection.contains(item.Id)) {
								menuItemsCollection.add(item.Id, Ext.create("Terrasoft.BaseViewModel", {
									values: {
										Caption: item.Name,
										Id: item.Id,
										Name: item.Name,
										Tag: item.Id,
										Click: {
											bindTo: "onMenuItemClick"
										}
									}
								}));
							}
						});
					},
					reloadPages: function(value) {
						var pages = this.get("pages");
						pages.clear();
						if (value) {
							var scope = this;
							SectionDesignDataModule.getDesignData(function(data) {
								SectionDesignDataModule.getEntities(value.referenceSchemaName, ["Name"], false,
									function(entitySchemaData) {
										var sectionData = data.module[data.mainModuleName];
										var sortedPages = sectionData.pages.sort(function(a, b) {
											if (a.position > b.position) {
												return 1;
											} else if (a.position < b.position) {
												return -1;
											} else {
												return 0;
											}
										});
										Terrasoft.each(sortedPages, function(editPage) {
											var page = {
												value: editPage.typeColumnValue,
												position: parseInt(editPage.position, 10)
											};
											Terrasoft.each(entitySchemaData, function(item) {
												if (item.Id === page.value) {
													page.displayValue = item.Name;
													var pageViewModel = scope.createPageViewModel(pages, page);
													pages.add(page.value, pageViewModel);
													return false;
												}
											});
										});
										viewModel.addNotExistedTypesMenuItems(pages, entitySchemaData);
										setDesignData(data);
										if (!this.initialization) {
											sandbox.publish("RefreshPagesConfig");
										}
									});
							});
						} else if (!this.initialization) {
							sandbox.publish("RefreshPagesConfig");
						}
					}
				},
				validationConfig: {
					pages: [
						function(value) {
							var result = {
								invalidMessage: "",
								isValid: true
							};

							if (!value.getCount()) {
								result.invalidMessage = localizableStrings.EmptyPagesError;
								result.isValid = false;
								viewModel.showInformationDialog(result.invalidMessage, null, {buttons: ["ok"]});
							}
							return result;
						}
					]
				}
			};
			var viewModel = Ext.create("Terrasoft.BaseViewModel", config);
			viewModel.subscribeEvents();
			return viewModel;
		}

		/**
		 * Возвращает модель отображения для страницы с типом
		 */
		function getPageViewModel(item, onEdit, onDelete) {
			var config = {
				values: {
					value: item.value,
					displayValue: item.displayValue,
					visible: true,
					allowDelete: true,
					position: item.position
				},
				methods: {
					getValue: function() {
						return {
							value: this.get("value"),
							displayValue: this.get("displayValue")
						};
					},
					getPosition: function() {
						return this.get("position");
					},
					getView: function() {
						var uid = Terrasoft.generateGUID();
						var config = {
							id: uid + "-ItemContainer",
							selectors: {
								wrapEl: "#" + uid + "-ItemContainer"
							},
							classes: {
								wrapClassName: ["page-type-item-container"]
							},
							visible: {
								bindTo: "visible"
							},
							items: [
								{
									id: uid + "-ItemLabelContainer",
									className: "Terrasoft.Container",
									selectors: {wrapEl: "#" + uid + "-ItemLabelContainer"},
									classes: {
										wrapClassName: ["page-type-item-left-container"]
									},
									items: [
										{
											className: "Terrasoft.Label",
											classes: {labelClass: "page-type-display-element"},
											markerValue: {bindTo: "displayValue"},
											caption: {bindTo: "displayValue"},
											click: {bindTo: "onItemClick"}
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
										wrapClassName: ["page-type-item-right-container"]
									},
									items: [
										{
											className: "Terrasoft.Button",
											imageConfig: resources.localizableImages.ItemDeleteButtonImage,
											style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
											classes: {
												wrapperClass: ["page-type-delete-button", "page-type-float-right"]
											},
											markerValue: {bindTo: "displayValue"},
											visible: {bindTo: "allowDelete"},
											click: {bindTo: "onItemDeleteButtonClick"}
										}
									]
								}
							],
							afterrender: {bindTo: "onVisualized"},
							afterrerender: {bindTo: "onVisualized"}
						};
						var view = Ext.create("Terrasoft.Container", config);
						return view;
					},
					visualize: function() {
						if (pagesTypeContainer) {
							var view = this.view;
							var position = this.getPosition();
							if (!view || view.destroyed) {
								view = this.getView();
								this.view = view;
								view.bind(this);
							}
							if (view.rendered) {
								view.reRender(position, pagesTypeContainer.getRenderToEl());
							} else {
								view.render(pagesTypeContainer.getRenderToEl(), position);
							}
						}
					},
					onItemClick: onEdit,
					onItemDeleteButtonClick: onDelete,
					onVisualized: function() {
						var pagesView = viewModel.get("pagesView");
						var value = this.get("value");
						if (!pagesView.contains(value)) {
							pagesView.add(value, this.view);
						}
					},
					onDisplayValueChanged: function() {
						SectionDesignDataModule.getDesignData(function(data) {
							this.onItemValueChanged(data);
							delete data.schemaManager;
							setDesignData(data);
							sandbox.publish("RefreshPagesConfig");
						}, this);
					},
					onPositionChanged: function(bbModel, value) {
						var typeId = this.get("value");
						var pages = viewModel.get("pages");
						if (pages.indexOf(this) !== value) {
							pages.remove(this);
							pages.insert(value, typeId, this);
						}
						SectionDesignDataModule.getDesignData(function(data) {
							this.onItemValueChanged(data);
							viewModel.actualizePagePositions(pages, data);
							delete data.schemaManager;
							setDesignData(data);
							sandbox.publish("RefreshPagesConfig");
						}, this);
					},
					onItemValueChanged: function(data) {
						var typeColumn = viewModel.get("typeColumn");
						var typeId = this.get("value");
						var displayValue = this.get("displayValue");
						var position = this.get("position");
						SectionDesignDataModule.modifyEntity(typeColumn.referenceSchemaName, {
							Name: displayValue
						}, typeId);
						var sectionConfig = data.module[data.mainModuleName];
						var pages = sectionConfig.pages;
						var currentPage;
						for (var i = 0; i < pages.length; i++) {
							var page = pages[i];
							if (page.typeColumnValue === typeId) {
								currentPage = page;
								break;
							}
						}
						if (currentPage) {
							SectionDesignerUtils.modifyTypedEditPage(sectionConfig.caption, currentPage, displayValue,
								typeId, position);
						} else {
							throw new Terrasoft.ItemNotFoundException({
								message: "Страница не найдена"
							});
//							SectionDesignerUtils.addTypedEditPage(data, typeId, displayValue, position,
//								typeColumn.referenceSchemaName, callback);
						}
					}
				}
			};
			var resultViewModel = Ext.create("Terrasoft.BaseViewModel", config);
			resultViewModel.on("change:displayValue", resultViewModel.onDisplayValueChanged, resultViewModel);
			resultViewModel.on("change:position", resultViewModel.onPositionChanged, resultViewModel);
			return resultViewModel;
		}

		/**
		 * Возвращает отображение для блока редактирования типа записи
		 * @param {String} editElementId идентификатор эллемента управления редактирования заголовка типа
		 * @returns {Terrasoft.Container}
		 */
		function getItemEditView(editElementId) {
			var config = {
				id: "itemEditInnerContainer",
				selectors: {wrapEl: "#itemEditInnerContainer"},
				classes: {
					wrapClassName: ["page-type-edit-container"]
				},
				items: [
					{
						id: "itemEditInnerElementContainer",
						className: "Terrasoft.Container",
						selectors: {wrapEl: "#itemEditInnerElementContainer"},
						classes: {
							wrapClassName: ["page-type-edit"]
						},
						items: [
							{
								id: editElementId,
								className: "Terrasoft.TextEdit",
								classes: {
									wrapClass: ["page-type-edit-wrap"]
								},
								markerValue: "typeName",
								value: {bindTo: "displayValue"},
								keydown: {bindTo: "onKeyDown"},
								focused: {bindTo: "textEditFocused"},
								placeholder: localizableStrings.RecordTypePlaceholder
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
							wrapClassName: ["page-type-buttons"]
						},
						items: [
							{
								className: "Terrasoft.Button",
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								classes: {
									textClass: ["page-type-button", "page-type-padding-left-0px"]
								},
								caption: localizableStrings.SaveCaption,
								markerValue: "saveButton",
								click: {bindTo: "onItemEditApplyButtonClick"}
							},
							{
								className: "Terrasoft.Button",
								caption: localizableStrings.CancelCaption,
								markerValue: "cancelButton",
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								classes: {
									textClass: ["page-type-button"]
								},
								click: {bindTo: "onItemEditCancelButtonClick"}
							},
							{
								className: "Terrasoft.Button",
								caption: localizableStrings.DownCaption,
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								markerValue: "downButton",
								classes: {
									textClass: [
										"page-type-button",
										"page-type-float-right",
										"page-type-padding-right-0px"
									]
								},
								click: {bindTo: "onItemEditDownButtonClick"},
								visible: {bindTo: "isEditMode"},
								enabled: {bindTo: "isItemEditDownButtonEnabled"}
							},
							{
								className: "Terrasoft.Button",
								caption: localizableStrings.UpCaption,
								style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
								classes: {
									textClass: ["page-type-button", "page-type-float-right"]
								},
								click: {bindTo: "onItemEditUpButtonClick"},
								markerValue: "upButton",
								visible: {bindTo: "isEditMode"},
								enabled: {bindTo: "isItemEditUpButtonEnabled"}
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
			var view = Ext.create("Terrasoft.Container", config);
			return view;
		}

		/**
		 * Добавляет блок редактирования элемента
		 * @param {Object} config конфигурационный объект
		 * @param {Object} config.renderTo контейнер, куда будет отрендерен блок редактирования
		 * @param {Function} config.onApply функция, которая отработает после нажатия на кнопку "Применить"
		 * @param {Function} config.onViewDestroyed функция, которая отработает после закрытия блока редактирования
		 * @param {Number} config.position Позиция, в которую будет отрендерен элемент внутри целевого контейнера
		 * @param {String} config.value Значение типа
		 */
		function addItemEdit(config) {
			var onApply = config.onApply;
			var onViewDestroyed = config.onViewDestroyed;
			var onPositionChanged = config.onPositionChanged;
			var value = config.value || {};
			var initialPosition = config.position;
			var editElementId = "TypeCaptionEdit";
			if (itemEditViewModel) {
				if (!itemEditViewModel.view.destroyed) {
					itemEditViewModel.view.destroy();
				}
				itemEditViewModel.set("value", value.value || Terrasoft.generateGUID());
				itemEditViewModel.set("displayValue", value.displayValue || null);
				itemEditViewModel.set("textEditFocused", false);
				itemEditViewModel.set("isEditMode", value.value ? true : false);
				itemEditViewModel.set("position", initialPosition);
				itemEditViewModel.onApply = onApply;
				itemEditViewModel.onViewDestroyed = onViewDestroyed;
				itemEditViewModel.onPositionChanged = onPositionChanged;
				itemEditViewModel.validationInfo.set("displayValue", {
					invalidMessage: "",
					isValid: true
				});
			} else {
				itemEditViewModel = Ext.create("Terrasoft.BaseViewModel", {
					columns: {
						displayValue: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							isRequired: true
						}
					},
					values: {
						displayValue: value.displayValue || null,
						value: value.value || Terrasoft.generateGUID(),
						textEditFocused: false,
						isEditMode: value.value ? true : false,
						position: initialPosition
					},
					methods: {
						onApply: onApply,
						onViewDestroyed: onViewDestroyed,
						onPositionChanged: onPositionChanged,
						onItemEditCancelButtonClick: function() {
							this.view.destroy();
						},
						internalOnViewDestroyed: function() {
							if (this.onViewDestroyed) {
								this.onViewDestroyed();
							}
						},
						onItemEditApplyButtonClick: function() {
							var value = this.get("value");
							var displayValue = this.get("displayValue");
							if (this.validate()) {
								if (this.onApply) {
									this.onApply({
										value: value,
										displayValue: displayValue
									});
								}
								this.onItemEditCancelButtonClick();
							}
						},
						onViewRendered: function() {
							this.set("textEditFocused", true);
						},
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
						onItemEditUpButtonClick: function() {
							var position = this.get("position");
							this.changePosition(position, position - 1);
						},
						onItemEditDownButtonClick: function() {
							var position = this.get("position");
							this.changePosition(position, position + 1);
						},
						changePosition: function(oldPosition, position) {
							this.set("position", position);
							this.view.reRender(position);
							if (this.onPositionChanged) {
								value.position = position;
								this.onPositionChanged({
									value: value.value,
									displayValue: value.displayValue,
									position: position,
									oldPosition: oldPosition
								});
							}
						},
						isItemEditUpButtonEnabled: function() {
							return this.get("position") > 0;
						},
						isItemEditDownButtonEnabled: function() {
							var pages = viewModel.get("pages");
							return this.get("position") + 1 < pages.getCount();
						}
					},
					validationConfig: {
						displayValue: [
							validateDuplicatedTypeName
						]
					}
				});
			}
			var view = getItemEditView(editElementId);
			view.bind(itemEditViewModel);
			view.render(config.renderTo, config.position);
			itemEditViewModel.view = view;
		}

		function initializeViewModel(data) {
			viewModel.initialization = true;
			if (data.mainModuleName) {
				SectionDesignDataModule.getEntitySchemaByName({
					name: data.mainModuleName,
					callback: function(entitySchema) {
						viewModel.entitySchemaName = entitySchema.name;
						availableEntityTypeColumns = getAvailableEntityTypeColumns(entitySchema);
						var section = data.module[data.mainModuleName];
						var typeColumnId = section.typeColumnId;
						var typeColumn = availableEntityTypeColumns.find(typeColumnId) || null;
						viewModel.set("visible", typeColumn !== null);
						viewModel.set("typeColumn", typeColumn);
						viewModel.set("canEditTypeColumn", availableEntityTypeColumns.getCount() > 0);
						viewModel.initialization = false;
					}
				});
			} else {
				availableEntityTypeColumns.clear();
				viewModel.set("typeColumn", null);
				viewModel.initialization = false;
			}
		}

		/**
		 * Устанавливает designData
		 * @param {Object} data
		 */
		function setDesignData(data) {
			var newData = {
				module: data.module || {},
				schemaManager: data.schemaManager || {}
			};
			SectionDesignDataModule.setDesignData(newData);
		}

		/**
		 * Функция отрисовки модуля
		 * @param {Ext.Element} renderTo контейнер для отрисовки модуля
		 */
		var render = function(renderTo) {
			if (!viewModel) {
				viewModel = getViewModel();
				sandbox.subscribe("OnSectionSchemaChanged", initializeViewModel);
				sandbox.subscribe("OnMultiPageChanged", function(value) {
					viewModel.set("visible", value);
					viewModel.silentMode = !value;
					if (value) {
						SectionDesignDataModule.getEntitySchemaByName({
							name: viewModel.entitySchemaName,
							callback: function(entitySchema) {
								availableEntityTypeColumns = getAvailableEntityTypeColumns(entitySchema);
								var typeColumn = viewModel.get("typeColumn");
								if (!typeColumn) {
									if (availableEntityTypeColumns.getCount() === 0) {
										SectionDesignerUtils.createEntityTypeColumn(function(column) {
											var typeColumn = {
												uId: column.uId,
												value: column.name,
												displayValue: column.caption,
												referenceSchemaName: column.referenceSchemaName
											};
											viewModel.set("typeColumn", typeColumn);
										});
									} else if (availableEntityTypeColumns.getCount() === 1) {
										typeColumn = availableEntityTypeColumns.getByIndex(0);
										viewModel.set("typeColumn", typeColumn);
									}
								}
							}
						});
					} else {
						viewModel.set("typeColumn", null);
					}
				});
				sandbox.subscribe("ValidateTypes", function() {
					return viewModel.validate();
				});
				SectionDesignDataModule.getDesignData(initializeViewModel);
			}
			var view = getView();
			view.bind(viewModel);
			//TODO Убрать когда будет исправлен рендеринг невидимых элементов
			// #246907
			// UI: Component. При вызове render у компонента, у которого свойство visible = false,
			// впоследствии невозможно управлять его видимостью
			view.renderTo = renderTo;
			view.render(renderTo);
		};

		/**
		 * Функция инициализации модуля
		 */
		var init = function() {
		};

		return {
			render: render,
			init: init
		};
	}
);
