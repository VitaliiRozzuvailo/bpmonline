define('GlobalDuplicateModule', ['ext-base', 'terrasoft',
	'GlobalDuplicateModuleResources', 'GlobalDuplicateModuleView'],
	function(Ext, Terrasoft, resources, GlobalDuplicateModuleView) {
	function upgrade(viewModel, entitySchemaName) {
		//viewModel.set('duplicateGrid', new Terrasoft.Collection());
		var baseGetViews =viewModel.methods.getViews;
		viewModel.methods.getViews = function() {
			this.set('duplicateGridData', new Terrasoft.Collection());
			this.set('gridLoading', false);
			this.set('duplicateStartEnabled', true);
			this.set('duplicateStopEnabled', true);
			this.set('duplicateScheduleEnabled', true);

			var views = baseGetViews.call(this);
			views.push({
				name: 'duplicates',
				caption: resources.localizableStrings['Duplicate' + entitySchemaName + 'Header']
			});
			return views;
		};



		var parentLoad = viewModel.methods.load;
		viewModel.methods.load = function(tabName, event) {
			if (tabName) {
				this.pageNumber = 0;
				this.set('tab', tabName);
			} else {
				tabName = this.get('tab');
			}
			if (tabName !== 'duplicates') {
				parentLoad.apply(this, arguments);
				return;
			}
			if (this.pageNumber <= 0) {
				var gridData = this.get('duplicateGridData');
				gridData.clear()
				this.ajaxProvider = Terrasoft.AjaxProvider;
				this.loadDuplicatesUnique();
			} else {
				this.loadDuplicatesUnique(this.pageNumber * 40);
			}
		}

		viewModel.methods.loadDuplicatesUnique = function(skip) {
			if (!Ext.isNumeric(skip) || skip < 0) {
				skip = 0;
			}
			this.set('gridLoading', true);
			callServiceMethod.call(this, this.ajaxProvider, "Get" + entitySchemaName + "DuplicatesParents",
				function(responce) {
					this.loadDuplicates(responce['Get' + entitySchemaName + 'DuplicatesParentsResult']);
				}, { skip: skip });
		}

		viewModel.methods.loadDuplicates = function(responce) {
			var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: entitySchemaName
			});
			esq.addColumn('Name');
			if (entitySchemaName === 'Account') {
				esq.addColumn('Phone');
				esq.addColumn('AdditionalPhone');
				esq.addColumn('Web');
			} else {
				esq.addColumn('MobilePhone');
				esq.addColumn('HomePhone');
				esq.addColumn('Email');
			}
			esq.filters.addItem(Terrasoft.createColumnInFilterWithParameters('Id', responce));
			esq.getEntityCollection(this.onLoadDuplicates, this);
		}

		viewModel.methods.loadDuplicatesChilds = function(responce) {
			var esq = Ext.create('Terrasoft.EntitySchemaQuery', {
				rootSchemaName: 'Vw' + entitySchemaName + 'Duplicate'
			});
			esq.addColumn('Entity2');
			esq.addColumn('Entity2.Name', 'Name');
			if (entitySchemaName === 'Account') {
				esq.addColumn('Entity2.Phone', 'Phone');
				esq.addColumn('Entity2.AdditionalPhone', 'AdditionalPhone');
				esq.addColumn('Entity2.Web', 'Web');
			} else {
				esq.addColumn('Entity2.MobilePhone', 'MobilePhone');
				esq.addColumn('Entity2.HomePhone', 'HomePhone');
				esq.addColumn('Entity2.Email', 'Email');
			}
			esq.rowCount = 1000;
			esq.addColumn('Entity1', 'Parent');
			esq.filters.addItem(Terrasoft.createColumnInFilterWithParameters('Entity1',responce));
			esq.getEntityCollection(this.onLoadDuplicatesChild, this);
		}

		viewModel.methods.onLoadDuplicatesChild = function(responce) {
			this.set('gridLoading', false);
			this.onLoadDuplicates(responce, true);
		}

		viewModel.methods.onLoadDuplicates = function(response, isChilds) {
			if (!Ext.isBoolean(isChilds)) {
				isChilds = false;
			}
			if (response.success) {
				var parentList = [];
				var gridData = this.get('duplicateGridData');

				var tempCollection = new Terrasoft.Collection();
				tempCollection.loadAll(gridData);
				Terrasoft.each(response.collection.getItems(), function(item) {
					if (!isChilds) {
						parentList.push(item.get('Id'));
					}
					tempCollection.add(item.get('Id'), item);
				}, this);
				gridData.clear();
				gridData.loadAll(tempCollection);
				if (!isChilds && parentList.length > 0) {
					this.loadDuplicatesChilds(parentList);
				}
			}
		}

		viewModel.methods.createViewConfig = function(viewsConfigName) {
			if (viewsConfigName === 'duplicates') {
				return GlobalDuplicateModuleView.generate(entitySchemaName);
			}
			return viewsConfigName;
		}

		viewModel.methods.onDuplicateStartClick = function() {
			callServiceMethod.call(this, this.ajaxProvider, entitySchemaName + "SearchStart",
				function(responce) {

				});
		}

		viewModel.methods.onDuplicateStopClick = function() {
			callServiceMethod.call(this, this.ajaxProvider, entitySchemaName + "SearchStop",
				function(responce) {

				});
		}

		viewModel.methods.onDuplicateScheduleClick = function() {

		}

		viewModel.methods.getStatusDescription = function() {
			return 'Description'
		}

		function callServiceMethod(ajaxProvider, methodName, callback, dataSend) {
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/SearchDuplicatesService/' + methodName;
			var request = ajaxProvider.request({
				url: requestUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
			return request;
		}
	}
	return {
		upgrade: upgrade
	};
});