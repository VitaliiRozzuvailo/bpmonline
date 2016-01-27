define("ViewModelSchemaDesignerViewModelGenerator", ["ext-base", "terrasoft", "ViewModelGeneratorV2",
		"GridLayoutEditItemModel"],
	function(Ext, Terrasoft) {
		/**
		 * @class Terrasoft.configuration.ViewModelSchemaDesignerViewModelGenerator
		 * Класс, генерирующий модель представления клиентской схемы в режиме дизайна.
		 */
		var viewModelGenerator = Ext.define("Terrasoft.configuration.ViewModelSchemaDesignerViewModelGenerator", {
			extend: "Terrasoft.ViewModelGenerator",
			alternateClassName: "Terrasoft.ViewModelSchemaDesignerViewModelGenerator",

			/**
			 * Массив схем представлений клиентских схем.
			 * @protected
			 * @type {Object[]}
			 */
			viewConfigHierarchy: null,

			/**
			 * @inheritdoc Terrasoft.ViewModelGenerator#generateSchemaClass
			 * @overridden
			 */
			generateSchemaClass: function() {
				this.viewConfigHierarchy = [];
				return this.callParent(arguments);
			},

			/**
			 * @inheritdoc Terrasoft.ViewModelGenerator#generateClass
			 * @overridden
			 */
			generateClass: function(parentClass, schema, viewConfig) {
				if (!schema.isDesignSchema) {
					this.viewConfigHierarchy.push(viewConfig);
				}
				return this.callParent(arguments);
			},

			/**
			 * @inheritdoc Terrasoft.ViewModelGenerator#addViewItemColumns
			 * @overridden
			 */
			addViewItemColumns: function(columnsConfig, config) {
				this.callParent(arguments);
				if (config.itemType === Terrasoft.ViewItemType.DESIGN_VIEW) {
					this.applyDesignedViewColumn(columnsConfig, config);
				}
			},

			/**
			 * Расширяет колонки схемы виртуальными колонками, необходимыми для работы настраиваемого представления.
			 * @protected
			 * @virtual
			 * @param {Object[]} columnsConfig Массив колонок схемы.
			 * @param {Object} config Конфигурация настраиваемое представление.
			 */
			applyDesignedViewColumn: function(columnsConfig, config) {
				var viewConfigHierarchy = this.viewConfigHierarchy;
				var currentSchemaView = (viewConfigHierarchy.length > 0)
					? viewConfigHierarchy[viewConfigHierarchy.length - 1]
					: [];
				var parentSchemaView = (viewConfigHierarchy.length > 1)
					? viewConfigHierarchy[viewConfigHierarchy.length - 2]
					: [];
				columnsConfig.ParentSchemaView = {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: parentSchemaView
				};
				columnsConfig.SchemaView = {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: currentSchemaView
				};
				columnsConfig.SchemaViewContainer = {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT,
					type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
					value: config.name
				};
			}

		});

		return Ext.create(viewModelGenerator);
	});