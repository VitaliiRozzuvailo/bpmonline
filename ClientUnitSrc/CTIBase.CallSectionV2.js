define("CallSectionV2", ["CallSectionV2Resources", "AudioPlayer", "CallSectionGridRowViewModel",
		"css!CallSectionGridRowViewModel"],
	function() {
		return {
			entitySchemaName: "Call",

			messages: {

				/**
				 * @message GetCallRecords
				 * Уведомляет о необходимости получения записей разговоров звонка.
				 * @param {Object} Информация о параметрах звонка.
				 */
				"GetCallRecords": {
					mode: Terrasoft.MessageMode.PTP,
					direction: Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			methods: {

				//region Methods: Private

				/**
				 * Останавливает воспроизведение записи звонка.
				 * @private
				 * @param {String} primaryColumnValue (optional) Значение первичной колонки. Если значение
				 * отсутствует, то будет выбрана активная запись.
				 */
				stopPlaying: function(primaryColumnValue) {
					var rowViewModel = this.getRowViewModel(primaryColumnValue);
					if (!rowViewModel) {
						return;
					}
					rowViewModel.set("IsPlaying", false);
				},

				/**
				 * Запрашивает записи разговоров.
				 * @private
				 * @param {String} primaryColumnValue (optional) Значение первичной колонки. Если значение
				 * отсутствует, то будет выбрана активная запись.
				 */
				requestRowCallRecords: function(primaryColumnValue) {
					var rowViewModel = this.getRowViewModel(primaryColumnValue);
					if (!rowViewModel) {
						return;
					}
					rowViewModel.requestCallRecords();
				},

				//endregion

				//region Methods: Protected

				/**
				 * Возвращает модель представления записи.
				 * @protected
				 * @param {String} primaryColumnValue (optional) Значение первичной колонки.
				 * @returns {Terrasoft.BaseViewModel} Модель представления выделенной записи.
				 */
				getRowViewModel: function(primaryColumnValue) {
					var rowId = primaryColumnValue || this.get("ActiveRow");
					var gridData = this.getGridData();
					var rowViewModelCollection = gridData.collection;
					return rowViewModelCollection.getByKey(rowId);
				},

				/**
				 * @inheritdoc Terrasoft.BaseSectionV2#initContextHelp
				 * @overridden
				 */
				initContextHelp: function() {
					this.set("ContextHelpId", 1024);
					this.callParent(arguments);
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilities#getGridRowViewModelConfig
				 * @overridden
				 */
				getGridRowViewModelConfig: function() {
					var gridRowViewModelConfig = this.callParent(arguments);
					this.Ext.apply(gridRowViewModelConfig, {
						Ext: this.Ext,
						Terrasoft: this.Terrasoft,
						sandbox: this.sandbox
					});
					return gridRowViewModelConfig;
				},

				/**
				 * @inheritdoc Terrasoft.BaseSection#getGridRowViewModelClassName
				 * @overridden
				 */
				getGridRowViewModelClassName: function() {
					return "Terrasoft.CallSectionGridRowViewModel";
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilities#initQueryColumns
				 * @overridden
				 */
				initQueryColumns: function(entitySchemaQuery) {
					this.callParent(arguments);
					if (!entitySchemaQuery.columns.contains("IntegrationId")) {
						entitySchemaQuery.addColumn("IntegrationId");
					}
				},

				/**
				 * @inheritdoc Terrasoft.BaseSection#onCardVisibleChanged
				 * @overridden
				 */
				onCardVisibleChanged: function() {
					this.callParent(arguments);
					var rowViewModel = this.getRowViewModel();
					if (!rowViewModel) {
						return;
					}
					rowViewModel.set("IsPlaying", false);
				},

				/**
				 * @inheritdoc Terrasoft.GridUtilities#onGridDataLoaded
				 * @overridden
				 */
				onGridDataLoaded: function() {
					this.callParent(arguments);
					this.requestRowCallRecords();
				},

				/**
				 * @inheritdoc Terrasoft.BaseSection#rowSelected
				 * @overridden
				 */
				rowSelected: function(primaryColumnValue) {
					this.callParent([primaryColumnValue]);
					this.stopPlaying();
					this.requestRowCallRecords(primaryColumnValue);
				},

				/**
				 * @inheritdoc Terrasoft.BaseSection#changeDataView
				 * @overridden
				 */
				changeDataView: function() {
					this.callParent(arguments);
					this.stopPlaying();
				}

				//endregion

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "remove",
					"name": "DataGridActiveRowCopyAction"
				},
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"unSelectRow": {"bindTo": "stopPlaying"}
					}
				},
				{
					"operation": "insert",
					"name": "AudioPlayer",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"values": {
						"className": "Terrasoft.AudioPlayer",
						"selectors": {"wrapEl": "#AudioPlayer"},
						"sourceId": {"bindTo": "getSourceId"},
						"sourceUrl": {"bindTo": "SourceUrl"},
						"playbackended": {"bindTo": "onPlaybackEnded"},
						"error": {"bindTo": "onPlayError"}
					}
				}, {
					"operation": "insert",
					"name": "PlayRecordButton",
					"parentName": "DataGrid",
					"propertyName": "activeRowActions",
					"index": 1,
					"values": {
						"className": "Terrasoft.Button",
						"style": Terrasoft.controls.ButtonEnums.style.GREY,
						"classes": {"textClass": ["audio-player-button"]},
						"visible": {"bindTo": "IsRecordPlayAvailable"},
						"caption": {"bindTo": "getPlayerButtonCaption"},
						"imageConfig": {"bindTo": "getPlayerButtonImageConfig"},
						"iconAlign": Terrasoft.controls.ButtonEnums.iconAlign.LEFT,
						"click": {"bindTo": "onRecordPlayerClick"},
						"markerValue": {"bindTo": "getPlayerButtonCaption"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);
