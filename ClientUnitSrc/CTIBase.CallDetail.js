define("CallDetail", ["AudioPlayer", "CallSectionGridRowViewModel", "css!CallSectionGridRowViewModel"], function() {
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
			},
			/**
			 * @message HistoryTabDeactivated
			 * Срабатывает, когда на странице произошла деактивация вкладки "История".
			 * @param {String} tabName Название вкладки.
			 */
			"HistoryTabDeactivated": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
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
			 * @param {String} primaryColumnValue Значение первичной колонки.
			 * @returns {Terrasoft.BaseViewModel} Модель представления выделенной записи.
			 */
			getRowViewModel: function(primaryColumnValue) {
				var rowId = primaryColumnValue || this.get("ActiveRow");
				var gridData = this.getGridData();
				var rowViewModelCollection = gridData.collection;
				return rowViewModelCollection.getByKey(rowId);
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
			 * @inheritdoc Terrasoft.GridUtilities#getGridRowViewModelClassName
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
				entitySchemaQuery.addColumn("IntegrationId");
			},

			/**
			 * @inheritdoc Terrasoft.BaseDetail#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("HistoryTabDeactivated", function() {
					this.stopPlaying();
				}, this, this.getUpdateDetailSandboxTags());
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
			 * Обработчик события выбора активной записи в реестре.
			 * @param {Guid} primaryColumnValue Идентификатор выбраного элемента.
			 */
			onRowSelected: function(primaryColumnValue) {
				this.stopPlaying();
				this.requestRowCallRecords(primaryColumnValue);
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#getAddRecordButtonVisible
			 * @overridden
			 */
			getAddRecordButtonVisible: function() {
				return false;
			},

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
			 * @overridden
			 */
			getCopyRecordMenuItem: Terrasoft.emptyFn,

			/**
			 * @inheritdoc Terrasoft.BaseGridDetailV2#updateDetail
			 * @overridden
			 */
			updateDetail: function() {
				this.callParent(arguments);
				this.stopPlaying();
			}

			//endregion

		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "merge",
				"name": "DataGrid",
				"values": {
					"unSelectRow": {"bindTo": "stopPlaying"},
					"selectRow": {"bindTo": "onRowSelected"},
					"activeRowActions": []
				}
			},
			{
				"operation": "insert",
				"name": "AudioPlayer",
				"parentName": "DataGrid",
				"propertyName": "activeRowActions",
				"index": 1,
				"values": {
					"className": "Terrasoft.AudioPlayer",
					"selectors": {"wrapEl": "#AudioPlayer"},
					"sourceId": {"bindTo": "getSourceId"},
					"sourceUrl": {"bindTo": "SourceUrl"},
					"playbackended": {"bindTo": "onPlaybackEnded"},
					"error": {"bindTo": "onPlayError"}
				}
			},
			{
				"operation": "insert",
				"name": "PlayRecordButton",
				"parentName": "DataGrid",
				"propertyName": "activeRowActions",
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
});
