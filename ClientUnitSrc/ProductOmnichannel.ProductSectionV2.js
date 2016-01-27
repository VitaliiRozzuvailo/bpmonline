define("ProductSectionV2", ["ProductManagementDistributionConstants"],
	function(DistributionConsts) {
		return {
			entitySchemaName: "Product",
			messages: {
				/**
				 * @message GetBackHistoryState
				 * Возвращает путь, куда переходить после нажатия на кнопку закрыть
				 * в окне настройки уровней каталога.
				 */
				"GetBackHistoryState": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.SUBSCRIBE
				}
			},
			methods: {
				/**
				 * Устанавливает переменную текущего состояния истории.
				 */
				setInitialHistoryState: function() {
					var initialHistoryState = this.sandbox.publish("GetHistoryState").hash.historyState;
					this.set("InitialHistoryState", initialHistoryState);
				},

				/**
				 * @inheritdoc Terrasoft.Configuration.BaseSectionV2#closeCard
				 * @overriden
				 */
				closeCard: function() {
					this.callParent(arguments);
					this.setInitialHistoryState();
				},

				/**
				 * @inheritdoc Terrasoft.Configuration.BaseSectionV2#subscribeSandboxEvents
				 * @overriden
				 */
				subscribeSandboxEvents: function() {
					this.callParent();
					this.setInitialHistoryState();
					this.sandbox.subscribe("GetBackHistoryState", function() {
						return this.get("InitialHistoryState");
					}, this, ["ProductTypeSectionV2", "ProductCatalogueLevelSectionV2"]);
				},

				/**
				 * Возвращает коллекцию действий раздела.
				 * Добавляет действие "Настройка каталога продуктов".
				 * @protected
				 * @overridden
				 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий.
				 */
				getSectionActions: function() {
					var actionMenuItems = this.callParent(arguments);
					actionMenuItems.addItem(this.getActionsMenuItem({
						"Type": "Terrasoft.MenuSeparator",
						"Caption": ""
					}));
					actionMenuItems.addItem(this.getActionsMenuItem({
						"Caption": {"bindTo": "Resources.Strings.ConfigureProductCatalogue"},
						"Enabled": true,
						"Click": {"bindTo": "navigateToProductCatalogueLevelSection"}
					}));
					actionMenuItems.addItem(this.getActionsMenuItem({
						"Caption": {"bindTo": "Resources.Strings.ConfigureProductTypes"},
						"Enabled": true,
						"Click": {"bindTo": "navigateToProductTypeSection"}
					}));
					return actionMenuItems;
				},

				/**
				 * Реализует действие "Настройка каталога продуктов".
				 * Переход в раздел Уровни каталога продуктов.
				 * @protected
				 */
				navigateToProductCatalogueLevelSection: function() {
					this.sandbox.publish("PushHistoryState", {
						hash: "SectionModuleV2/ProductCatalogueLevelSectionV2"
					});
				},

				/**
				 * Реализует действие "Настройка типов и фильтров продуктов".
				 * Переход в раздел Типы продуктов.
				 * @protected
				 */
				navigateToProductTypeSection: function() {
					this.sandbox.publish("PushHistoryState", {
						hash: "SectionModuleV2/ProductTypeSectionV2"
					});
				},

				/**
				 * Возвращает настройку менеджера групп.
				 * @protected
				 * @overriden
				 */
				getFolderManagerConfig: function() {
					var config = this.callParent(arguments);
					config.catalogueRootRecordItem = {
						value: DistributionConsts.ProductFolder.RootCatalogueFolder.RootId,
						displayValue: this.get("Resources.Strings.ProductCatalogueRootCaption")
					};
					var filterValue = this.get("SectionFiltersValue");
					if (filterValue && filterValue.getCount() > 0) {
						var folderFilter = filterValue.get("FolderFilters");
						config.activeFolderId = (folderFilter && folderFilter.length > 0) ?
							(folderFilter[0].folderId || folderFilter[0].value) : null;
					}
					return config;
				}
			},
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});
