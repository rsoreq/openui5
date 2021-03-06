/* global QUnit, sinon */
// These are some globals generated due to fl (signals, hasher) and m (hyphenation) libs.

sap.ui.define([
	"../QUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core",
	"sap/ui/core/format/ListFormat",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/V4AnalyticsTableType",
	"sap/m/Text",
	"sap/m/Button",
	"sap/ui/model/odata/v4/ODataListBinding",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/base/Event",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/mdc/p13n/FlexUtil",
	"sap/ui/mdc/table/TableSettings",
	"sap/ui/Device",
	"sap/m/VBox",
	"sap/m/Link"
], function(
	MDCQUnitUtils,
	QUtils,
	KeyCodes,
	Core,
	ListFormat,
	Table,
	Column,
	GridTableType,
	ResponsiveTableType,
	V4AnalyticsTableType,
	Text,
	Button,
	ODataListBinding,
	Sorter,
	Filter,
	JSONModel,
	Event,
	containsOrEquals,
	FlexUtil,
	TableSettings,
	Device,
	VBox,
	Link
) {
	"use strict";

	var aTestedTypes = ["Table", "ResponsiveTable"];

	function wait(iMilliseconds) {
		return new Promise(function(resolve) {
			setTimeout(resolve, iMilliseconds);
		});
	}

	function triggerDragEvent(sDragEventType, oControl) {
		var oJQueryDragEvent = jQuery.Event(sDragEventType);
		var oNativeDragEvent;

		if (typeof Event === "function") {
			oNativeDragEvent = new Event(sDragEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE
			oNativeDragEvent = document.createEvent("Event");
			oNativeDragEvent.initEvent(sDragEventType, true, true);
		}

		// Fake the DataTransfer object. This is the only cross-browser solution.
		oNativeDragEvent.dataTransfer = {
			dropEffect: "none",
			effectAllowed: "none",
			files: [],
			items: [],
			types: [],
			setDragImage: function() {
			},
			setData: function() {
			},
			getData: function() {
			}
		};

		oJQueryDragEvent.originalEvent = oNativeDragEvent;

		var oDomRef = oControl.getDomRef ? oControl.getDomRef() : oControl;
		if (oDomRef) {
			jQuery(oDomRef).trigger(oJQueryDragEvent);
		}
	}

	QUnit.module("sap.ui.mdc.Table", {
		beforeEach: function(assert) {
			this.oTable = new Table();
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oTable);
		}
	});

	QUnit.test("Instantiate", function(assert) {
		assert.ok(this.oTable);
		assert.ok(this.oTable.isA("sap.ui.mdc.IxState"));
	});

	QUnit.test("Create UI5 Grid Table (default) after initialise", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);
			done();
		}.bind(this));
	});

	QUnit.test("inner table is a GridTable, with No template", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);

			assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
			done();
		}.bind(this));

	});

	QUnit.test("Columns added to inner table", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			minWidth: 8.4,
			header: "Test1",
			template: new Text({
				text: "Test1"
			}),
			creationTemplate: new Text({
				text: "Test1"
			})
		}));
		this.oTable.insertColumn(new Column({
			minWidth: 8.5,
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}), 0);
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 2);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test", "column0: label is correct");
			assert.equal(aInnerColumns[0].getMinWidth(), 136, "column0: minWidth is correct");
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test1", "column1: label is correct");
			assert.equal(aInnerColumns[1].getMinWidth(), 134, "column1: minWidth is correct");
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test2", "column1: label is correct");
			assert.equal(aInnerColumns[2].getMinWidth(), 128, "column2: minWidth is correct (default value)");
			assert.equal(aInnerColumns[0].getTemplate().getText(), "Test", "column0: template is correct");
			assert.equal(aInnerColumns[0].getTemplate().getWrapping(), false, "column0: template wrapping is disabled");
			assert.equal(aInnerColumns[0].getTemplate().getRenderWhitespace(), false, "column0: template renderWhitespace is disabled");
			assert.equal(aInnerColumns[1].getTemplate().getText(), "Test1", "column1: template is correct");
			assert.equal(aInnerColumns[0].getCreationTemplate(), null, "column0: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getText(), "Test1", "column1: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getWrapping(), false, "column1: creationTemplate wrapping is disabled");
			assert.equal(aInnerColumns[1].getCreationTemplate().getRenderWhitespace(), false, "column1: creationTemplate renderWhitespace is disabled");
			done();
		}.bind(this));
	});

	QUnit.test("Columns added to inner table - one by one E.g. pers", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.initialized().then(function() {

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "Test2"
				})
			}), 0);

			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal("Test2", aInnerColumns[0].getLabel().getText());
			done();
		}.bind(this));

	});

	QUnit.test("rows binding - binds the inner table - manually after table creation", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.initialized().then(function() {
			var sPath = "/foo";
			this.oTable.bindRows({
				path: sPath
			});

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test");
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test2");
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("rows"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("rows binding - via metadataInfo, before table creation", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		var sCollectionPath = "/foo";
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: sCollectionPath
				}
			}
		});

		this.oTable.initialized().then(function() {
			// Initilaized has to be used again as the binding itself is done when the initialized Promise is fired
			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable);
				assert.ok(this.oTable._bTableExists);

				assert.ok(this.oTable._oTable.isBound("rows"));

				var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");

				assert.strictEqual(oBindingInfo.path, sCollectionPath);
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("bindRows manually", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.initialized().then(function() {
			var sPath = "/foo";

			this.oTable.bindRows({
				path: sPath
			});

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test");
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test2");
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("rows"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("Destroy", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);
		sinon.spy(this.oTable, "exit");

		this.oTable.initialized().then(function() {

			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);

			this.oTable.destroy();

			assert.ok(!this.oTable._oTemplate);
			assert.ok(this.oTable.exit.calledOnce);
			done();
		}.bind(this));
	});

	QUnit.test("Create UI5 Responsive Table after initialise (model is set on the parent/control)", function(assert) {
		var done = assert.async();

		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);
			assert.ok(this.oTable._oTable.getAutoPopinMode(), "autoPopinMode is true");
			done();
		}.bind(this));

	});

	QUnit.test("inner table is a ResponsiveTable with ColumnListItem as its template", function(assert) {
		var done = assert.async();

		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);

			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(this.oTable._oTemplate.isA("sap.m.ColumnListItem"));
			done();
		}.bind(this));
	});

	QUnit.test("Columns added to inner ResponsiveTable", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			importance: "High",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			importance: "Low",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			minWidth: 8.5,
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.equal(aInnerColumns[0].getHeader().getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[0].getImportance(), "High");
			assert.equal(aInnerColumns[0].getAutoPopinWidth(), 8, "minWidth is not set, default value is 8");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[1].getImportance(), "None", "importance is not set, default value is None");
			assert.equal(aInnerColumns[1].getAutoPopinWidth(), 8.5, "autoPopinWidth is set properly");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.equal(aInnerColumns[2].getImportance(), "Low");
			done();
		}.bind(this));
	});

	QUnit.test("Columns added to inner ResponsiveTable - one by one E.g. pers", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.initialized().then(function() {

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "Test2"
				})
			}), 0);

			this.oTable.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal("Test2", aInnerColumns[0].getHeader().getText());
			assert.equal(aMDCColumns[2].getHeader(), aInnerColumns[2].getHeader().getText());
			assert.equal("Test3", aInnerColumns[2].getHeader().getText());
			done();
		}.bind(this));
	});

	QUnit.test("rows binding - binds the inner ResponsiveTable - manually", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});

		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.initialized().then(function() {
			var sPath = "/foo";
			this.oTable.bindRows({
				path: sPath
			});

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("items"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("items");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("rows binding - binds the inner ResponsiveTable - via metadataInfo, before table creation", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();

		var sCollectionPath = "/foo";
		this.oTable = new Table({
			type: "ResponsiveTable",
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: sCollectionPath
				}
			}
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.initialized().then(function() {
			// Initilaized has to be used again as the binding itself is done when the initialized Promise is fired
			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable);

				assert.ok(this.oTable._oTable.isBound("items"));

				var oBindingInfo = this.oTable._oTable.getBindingInfo("items");

				assert.strictEqual(oBindingInfo.path, sCollectionPath);
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("bindRows manually (Responsive)", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.addColumn(new Column({
			header: "Test3",
			template: new Text({
				text: "Test3"
			})
		}));

		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 1);

		this.oTable.initialized().then(function() {
			var sPath = "/foo";

			this.oTable.bindRows({
				path: sPath
			});

			assert.ok(this.oTable._oTable);
			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3");
			assert.ok(this.oTable._oTable.isBound("items"));

			var oBindingInfo = this.oTable._oTable.getBindingInfo("items");

			assert.equal(oBindingInfo.path, sPath);
			done();
		}.bind(this));
	});

	QUnit.test("Destroy - MTable - remove template", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.initialized().then(function() {

			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);

			var oToolbar = this.oTable._oToolbar;
			this.oTable.destroy();

			assert.ok(!this.oTable._oTemplate);
			assert.ok(!this.oTable._oToolbar);
			// Toolbar is destroyed
			assert.strictEqual(oToolbar.bIsDestroyed, true);

			done();
		}.bind(this));
	});

	// Switch table type and test APIs
	QUnit.test("Switch table type and test APIs", function(assert) {
		var done = assert.async(), fInnerTableDestroySpy, fInnerTemplateDestroySpy;
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(!this.oTable._oTemplate);

			fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");

			assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));

			// Switch table
			assert.ok(fInnerTableDestroySpy.notCalled);
			this.oTable.setSelectionMode("Single");
			this.oTable.setThreshold(10);
			this.oTable.setType("ResponsiveTable");

			assert.ok(fInnerTableDestroySpy.calledOnce);

			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable);
				assert.ok(this.oTable._oTemplate);
				assert.ok(this.oTable._oTemplate.isA("sap.m.ColumnListItem"));
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable.getThreshold());
				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
				fInnerTemplateDestroySpy = sinon.spy(this.oTable._oTemplate, "destroy");

				// Setting same table type does nothing
				this.oTable.setType("ResponsiveTable");
				this.oTable.setSelectionMode("Multi");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), false);

				// Setting same table type does nothing
				this.oTable.setType(new ResponsiveTableType({
					growingMode: "Scroll"
				}));

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				// growingScrollToLoad of the inner table will be set
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), true);
				// growing of inner table is set
				assert.equal(this.oTable._oTable.getGrowing(), true);

				// Updating the table type will update the properties on the table
				this.oTable.getType().setGrowingMode("Basic");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				// growingScrollToLoad of the inner table will be reset
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), false);
				// growing of inner table is set
				assert.equal(this.oTable._oTable.getGrowing(), true);

				// Updating the table type will update the properties on the table
				this.oTable.getType().setGrowingMode("None");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fInnerTemplateDestroySpy.notCalled);
				// growingScrollToLoad of the inner table will be reset
				assert.equal(this.oTable._oTable.getGrowingScrollToLoad(), false);
				// growing of inner table is set
				assert.equal(this.oTable._oTable.getGrowing(), false);


				this.oTable.setType("Table");
				assert.ok(fInnerTableDestroySpy.calledOnce);
				assert.ok(fInnerTemplateDestroySpy.calledOnce);
				this.oTable.initialized().then(function() {
					assert.ok(this.oTable._oTable);
					assert.ok(!this.oTable._oTemplate);
					assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
					assert.equal(this.oTable._oTable.getThreshold(), this.oTable.getThreshold());
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	// Switch table type to V4AnalyticsTableType
	QUnit.test("Switch table type to V4AnalyticsTableType", function(assert) {
		var done = assert.async(), fInnerTableDestroySpy, fInnerTemplateDestroySpy, fRowModeDestroySpy;

		// Switch table immediately to Responsive table to switch it later to V4Analytics Table
		this.oTable.setType("ResponsiveTable");

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
			fInnerTemplateDestroySpy = sinon.spy(this.oTable._oTemplate, "destroy");

			// Switch table to V4Analytics Table
			this.oTable.setType(new V4AnalyticsTableType({}));
			assert.ok(fInnerTableDestroySpy.calledOnce);
			assert.ok(fInnerTemplateDestroySpy.calledOnce);

			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable);
				assert.ok(!this.oTable._oTemplate);

				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");

				// Check that the table is V4 Analytics Table that is Grid Table
				assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
				var that = this;
				assert.equal(that.oTable._oTable.getDependents().length, 1, "Plugin available");
				assert.ok(that.oTable._oTable.getDependents()[0].isA("sap.ui.table.plugins.V4Aggregation"), "Plugin is a V4 Plugin");
				fRowModeDestroySpy = sinon.spy(this.oTable._oTable.getRowMode(), "destroy");

				// Setting same table type only updates properties
				this.oTable.setType(new V4AnalyticsTableType({
					rowCountMode: "Fixed"
				}));
				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fRowModeDestroySpy.calledOnce);
				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.FixedRowMode"), "The inner Table has a fixed row mode");
				assert.equal(this.oTable._oTable.getRowMode().getRowCount(), 10);

				this.oTable.setType("Table");

				// changing type leads to a destroy call
				assert.ok(fInnerTableDestroySpy.calledOnce);
				assert.ok(fInnerTemplateDestroySpy.calledOnce);
				this.oTable.initialized().then(function() {
					assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
					var that = this;
					assert.equal(that.oTable._oTable.getDependents().length, 0, "Plugin V4Aggregation is not available");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	// Switch table type immediately
	QUnit.test("Switch table type immediately after create", function(assert) {
		var done = assert.async(), fInnerTableDestroySpy, fInnerTemplateDestroySpy, fRowModeDestroySpy, bHideEmptyRows;
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		assert.ok(!this.oTable._oTemplate);

		// Switch table immediately
		this.oTable.setType("ResponsiveTable");

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oTemplate);

			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(this.oTable._oTemplate.isA("sap.m.ColumnListItem"));
			fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");
			fInnerTemplateDestroySpy = sinon.spy(this.oTable._oTemplate, "destroy");

			// Setting same table type does nothing
			this.oTable.setType("ResponsiveTable");
			assert.ok(this.oTable._oTable.isA("sap.m.Table"));
			assert.ok(fInnerTableDestroySpy.notCalled);
			assert.ok(fInnerTemplateDestroySpy.notCalled);

			this.oTable.setType("Table");
			assert.ok(fInnerTableDestroySpy.calledOnce);
			assert.ok(fInnerTemplateDestroySpy.calledOnce);

			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable);
				assert.ok(!this.oTable._oTemplate);

				fInnerTableDestroySpy = sinon.spy(this.oTable._oTable, "destroy");

				assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));

				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode"), "The inner GridTable has an auto row mode");
				assert.equal(this.oTable._oTable.getRowMode().getMinRowCount(), 10);

				fRowModeDestroySpy = sinon.spy(this.oTable._oTable.getRowMode(), "destroy");
				bHideEmptyRows = this.oTable._oTable.getRowMode().getHideEmptyRows();

				// Setting same table type only updates properties
				this.oTable.setType(new GridTableType({
					rowCountMode: "Fixed"
				}));

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fRowModeDestroySpy.calledOnce);
				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.FixedRowMode"), "The inner GridTable has a fixed row mode");
				assert.equal(this.oTable._oTable.getRowMode().getRowCount(), 10);
				assert.equal(this.oTable._oTable.getRowMode().getHideEmptyRows(), bHideEmptyRows);

				// Updating the table type instance also updates properties
				this.oTable.getType().setRowCount(3);

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.FixedRowMode"), "The inner GridTable has a fixed row mode");
				assert.equal(this.oTable._oTable.getRowMode().getRowCount(), 3);

				fRowModeDestroySpy = sinon.spy(this.oTable._oTable.getRowMode(), "destroy");
				bHideEmptyRows = !bHideEmptyRows;
				this.oTable._oTable.getRowMode().setHideEmptyRows(bHideEmptyRows);

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCountMode("Auto");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fRowModeDestroySpy.calledOnce);
				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode"), "The inner GridTable has an auto row mode");
				assert.equal(this.oTable._oTable.getRowMode().getMinRowCount(), 3);
				assert.equal(this.oTable._oTable.getRowMode().getHideEmptyRows(), bHideEmptyRows);

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCount(5);

				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode"), "The inner GridTable has an auto row mode");
				assert.equal(this.oTable._oTable.getRowMode().getMinRowCount(), 5);

				// Updating the table type instance also updates properties of the inner table
				this.oTable.getType().setRowCountMode("Fixed");

				assert.ok(fInnerTableDestroySpy.notCalled);
				// inner table is updated
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.FixedRowMode"), "The inner GridTable has a fixed row mode");
				assert.equal(this.oTable._oTable.getRowMode().getRowCount(), 5);

				fRowModeDestroySpy = sinon.spy(this.oTable._oTable.getRowMode(), "destroy");

				// Setting same table type only updates properties
				this.oTable.setType("Table");

				assert.ok(fInnerTableDestroySpy.notCalled);
				assert.ok(fRowModeDestroySpy.notCalled);
				// inner table is updated to defaults
				assert.ok(this.oTable._oTable.getRowMode().isA("sap.ui.table.rowmodes.AutoRowMode"), "The inner GridTable has an auto row mode");
				assert.equal(this.oTable._oTable.getRowMode().getMinRowCount(), 10);
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("bindRows with rowCount without wrapping dataReceived", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			header: "Test",
			showRowCount: true,
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.initialized().then(function() {
			var sPath = "/foo";

			this.oTable.bindRows({
				path: sPath
			});

			var oBindingInfo = this.oTable._oTable.getBindingInfo("items");

			assert.equal(oBindingInfo.path, sPath);

			var fDataReceived = oBindingInfo.events["dataReceived"];

			sinon.stub(this.oTable._oTable, "getBinding");

			var iCurrentLength = 10;
			var bIsLengthFinal = true;
			var oRowBinding = {
				getLength: function() {
					return iCurrentLength;
				},
				isLengthFinal: function() {
					return bIsLengthFinal;
				}
			};
			this.oTable._oTable.getBinding.returns(oRowBinding);

			assert.equal(this.oTable._oTitle.getText(), "Test");

			fDataReceived();
			assert.equal(this.oTable._oTitle.getText(), "Test (10)");

			bIsLengthFinal = false;
			fDataReceived();
			assert.equal(this.oTable._oTitle.getText(), "Test");

			done();
		}.bind(this));
	});

	QUnit.test("bindRows with rowCount with wrapping dataReceived", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			header: "Test",
			showRowCount: true,
			type: "Table"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.initialized().then(function() {
			var sPath = "/foo";
			var fCustomDataReceived = sinon.spy();
			var oRowBinding = sinon.createStubInstance(ODataListBinding);
			oRowBinding.getLength.returns(10);
			oRowBinding.isLengthFinal.returns(true);
			oRowBinding.getContexts.returns([]);

			sinon.stub(this.oTable._oTable, "getBinding");
			this.oTable._oTable.getBinding.returns(oRowBinding);
			var fnGetBindingInfo = this.oTable._oTable.getBindingInfo;
			var oGetBindingInfoStub = sinon.stub(this.oTable._oTable, "getBindingInfo").returns({
				path: sPath
			});
			sinon.stub(this.oTable._oTable, "unbindRows");// TODO: remove ui.table seems to fail due to this

			this.oTable.bindRows({
				path: sPath,
				events: {
					dataReceived: fCustomDataReceived
				}
			});

			oGetBindingInfoStub.reset();
			this.oTable._oTable.getBindingInfo = fnGetBindingInfo;
			var oBindingInfo = this.oTable._oTable.getBindingInfo("rows");

			assert.equal(oBindingInfo.path, sPath);

			var fDataReceived = oBindingInfo.events["dataReceived"];

			assert.equal(this.oTable._oTitle.getText(), "Test");
			assert.ok(fCustomDataReceived.notCalled);

			fDataReceived(new Event("dataReceived", oRowBinding));
			assert.equal(this.oTable._oTitle.getText(), "Test (10)");
			assert.ok(fCustomDataReceived.calledOnce);

			oRowBinding.isLengthFinal.returns(false);
			fDataReceived(new Event("dataReceived", oRowBinding));
			assert.equal(this.oTable._oTitle.getText(), "Test");
			assert.ok(fCustomDataReceived.calledTwice);

			done();
		}.bind(this));
	});

	// General tests --> relevant for both table types
	QUnit.test("check for intial column index", function(assert) {
		var done = assert.async();
		// Destroy the old/default table
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			columns: [
				new Column({
					id: "foo1",
					initialIndex: 1,
					header: "Test1",
					template: new Text({
						text: "template1"
					})
				}), new Column({
					id: "foo0",
					initialIndex: 0,
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				})

			]
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.initialized().then(function() {
			this.oTable.bindRows({
				path: "/"
			});

			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			var oInnerColumnListItem = this.oTable._oTemplate;
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test0");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test1");
			// Check cells
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template0");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template1");

			this.oTable.insertColumn(new Column({
				header: "Test2",
				template: new Text({
					text: "template2"
				})
			}), 1);
			// Intial index no longer used
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			oInnerColumnListItem = this.oTable._oTemplate;
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test0");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test1");
			// Check cells
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template0");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template2");
			assert.equal(oInnerColumnListItem.getCells()[2].getText(), "template1");

			this.oTable.removeColumn("foo0");
			// Intial index no longer used
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			oInnerColumnListItem = this.oTable._oTemplate;
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2");
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test1");
			// Check cells
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template2");
			assert.equal(oInnerColumnListItem.getCells()[1].getText(), "template1");

			this.oTable.removeColumn("foo1");
			// Intial index no longer used
			aMDCColumns = this.oTable.getColumns();
			aInnerColumns = this.oTable._oTable.getColumns();
			oInnerColumnListItem = this.oTable._oTemplate;
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2");
			// Check cells
			assert.equal(oInnerColumnListItem.getCells()[0].getText(), "template2");

			done();
		}.bind(this));
	});

	QUnit.test("bindAggregation for columns uses default behaviour", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.initialized().then(function() {
			var sPath = "/columnPath";
			var oTemplate = new Column({
				header: '{name}'
			});
			this.oTable.bindAggregation("columns", {
				path: sPath,
				template: oTemplate
			});

			var oBindingInfo = this.oTable.getBindingInfo("columns");
			assert.equal(oBindingInfo.path, sPath);
			assert.equal(oBindingInfo.template, oTemplate);
			done();
		}.bind(this));
	});

	QUnit.test("sort indicator is set correctly at the inner grid table columns", function(assert) {
		var done = assert.async();

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperty: "name"
		}));

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperty: "age"
		}));

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "name",
				label: "name"
			},
			{
				name: "age",
				label: "age"
			}
		]);

		this.oTable.initialized().then(function() {
			var oTable = this.oTable,
				oSortConditions = {
					sorters: [
						{name: "name", descending: true}
					]
				};

			oTable.setSortConditions(oSortConditions);
			oTable.bindRows({
				path: "/foo"
			});

			oTable.awaitPropertyHelper().then(function() {
				assert.deepEqual(oTable.getSortConditions(), oSortConditions, "sortConditions property is correctly set");
				var aInnerColumns = oTable._oTable.getColumns();
				assert.equal(aInnerColumns[0].getSorted(), true);
				assert.equal(aInnerColumns[0].getSortOrder(), "Descending");
				assert.equal(aInnerColumns[1].getSorted(), false);
				done();
			});
		}.bind(this));
	});

	QUnit.test("sort indicator is set correctly at the inner mobile table columns", function(assert) {
		var done = assert.async();

		this.oTable.setType("ResponsiveTable");
		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperty: "name"
		}));

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperty: "age"
		}));

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "name",
				label: "name"
			},
			{
				name: "age",
				label: "age"
			}
		]);

		this.oTable.initialized().then(function() {
			var oTable = this.oTable,
				oSortConditions = {
					sorters: [
						{name: "age", descending: false}
					]
				};

			oTable.setSortConditions(oSortConditions);
			oTable.bindRows({
				path: "/foo"
			});

			oTable.awaitPropertyHelper().then(function() {
				assert.deepEqual(oTable.getSortConditions(), oSortConditions, "sortConditions property is correctly set");
				var aInnerColumns = oTable._oTable.getColumns();
				assert.equal(aInnerColumns[0].getSortIndicator(), "None");
				assert.equal(aInnerColumns[1].getSortIndicator(), "Ascending");
				done();
			});
		}.bind(this));
	});

	QUnit.test("Sort Change triggered", function(assert) {
		var done = assert.async();

		this.oTable.setP13nMode(["Sort"]);

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperty: "name"
		}));

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperty: "age"
		}));

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "name",
				label: "name"
			},
			{
				name: "age",
				label: "age"
			}
		]);

		this.oTable.initialized().then(function() {
			var oTable = this.oTable,
				oSortConditions = {
					sorters: [
						{name: "name", descending: true}
					]
				};

			oTable.setSortConditions(oSortConditions);
			oTable.bindRows({
				path: "/foo"
			});

			oTable.awaitPropertyHelper().then(function() {
				assert.deepEqual(oTable.getSortConditions(), oSortConditions, "sortConditions property is correctly set");
				var aInnerColumns = oTable._oTable.getColumns();
				assert.equal(aInnerColumns[0].getSorted(), true);
				assert.equal(aInnerColumns[0].getSortOrder(), "Descending");
				assert.equal(aInnerColumns[1].getSorted(), false);
				oTable.retrieveAdaptationController().then(function (oAdaptationController) {

					var oPropertyInfoPromise = new Promise(function(resolve, reject) {
						resolve([
							{name: "name", sortable: true},
							{name: "age", sortable: true}
						]);
					});

					sinon.stub(oAdaptationController, "_retrievePropertyInfo").returns(oPropertyInfoPromise);
					oAdaptationController._retrievePropertyInfo().then(function() {


						var FlexUtil_handleChanges_Stub = sinon.stub(FlexUtil, "handleChanges");
						FlexUtil_handleChanges_Stub.callsFake(function(aChanges) {
							assert.equal(aChanges.length, 2);
							assert.equal(aChanges[0].changeSpecificData.changeType, "removeSort");
							assert.equal(aChanges[0].changeSpecificData.content.name, "name");
							assert.equal(aChanges[0].changeSpecificData.content.descending, true);
							assert.equal(aChanges[1].changeSpecificData.changeType, "addSort");
							assert.equal(aChanges[1].changeSpecificData.content.name, "name");
							assert.equal(aChanges[1].changeSpecificData.content.descending, false);

							FlexUtil_handleChanges_Stub.restore();
							done();
						});

						TableSettings.createSort(oTable, "name", true);
					});
				});
			});
		}.bind(this));
	});

	QUnit.test("Set filter conditions", function(assert) {
		var oFilterConditions = {
			name: [
				{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: ["test"]
				}
			]
		};

		this.oTable.setFilterConditions(oFilterConditions);
		assert.deepEqual(this.oTable.getFilterConditions(), oFilterConditions, "Filter conditions set");

		this.oTable.setFilterConditions(null);
		assert.deepEqual(this.oTable.getFilterConditions(), {}, "Filter conditions removed");
	});

	QUnit.test("setThreshold", function(assert) {
		var done = assert.async();
		var setThresholdSpy = sinon.spy(this.oTable, "setThreshold");
		var invalidateSpy = sinon.spy(this.oTable, "invalidate");

		this.oTable.setThreshold(10);

		assert.equal(invalidateSpy.callCount, 0);
		assert.ok(setThresholdSpy.returned(this.oTable));

		this.oTable.initialized().then(function() {
			invalidateSpy.reset();
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable.getThreshold());

			this.oTable.setThreshold(-1);
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable._oTable.getMetadata().getProperty("threshold").defaultValue);

			this.oTable.setThreshold(20);
			assert.equal(this.oTable._oTable.getThreshold(), 20);

			this.oTable.setThreshold(undefined);
			assert.equal(this.oTable._oTable.getThreshold(), this.oTable._oTable.getMetadata().getProperty("threshold").defaultValue);
			assert.equal(invalidateSpy.callCount, 0);

			this.oTable.setThreshold(30);
			this.oTable.setType("ResponsiveTable");

			this.oTable.initialized().then(function() {
				invalidateSpy.reset();
				assert.equal(this.oTable._oTable.getGrowingThreshold(), 30);

				this.oTable.setThreshold(-1);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable._oTable.getMetadata().getProperty("growingThreshold").defaultValue);

				this.oTable.setThreshold(20);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), 20);

				this.oTable.setThreshold(null);
				assert.equal(this.oTable._oTable.getGrowingThreshold(), this.oTable._oTable.getMetadata().getProperty("growingThreshold").defaultValue);
				assert.equal(invalidateSpy.callCount, 0);

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("noDataText", function(assert) {
		var done = assert.async();
		var setNoDataSpy = sinon.spy(this.oTable, "setNoDataText");
		var invalidateSpy = sinon.spy(this.oTable, "invalidate");
		var sNoDataText = "Some No Data text";
		this.oTable.setNoDataText(sNoDataText);

		assert.equal(invalidateSpy.callCount, 0);
		assert.ok(setNoDataSpy.returned(this.oTable));

		this.oTable.initialized().then(function() {
			invalidateSpy.reset();
			assert.equal(this.oTable._oTable.getNoData(), this.oTable.getNoDataText());

			this.oTable.setNoDataText();
			assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());

			this.oTable.setNoDataText("foo");
			assert.equal(this.oTable._oTable.getNoData(), "foo");

			this.oTable.setNoDataText(undefined);
			assert.equal(this.oTable._oTable.getNoData(), this.oTable._getNoDataText());
			assert.equal(invalidateSpy.callCount, 0);

			this.oTable.setNoDataText("test");
			this.oTable.setType("ResponsiveTable");

			this.oTable.initialized().then(function() {
				invalidateSpy.reset();
				assert.equal(this.oTable._oTable.getNoDataText(), "test");

				this.oTable.setNoDataText();
				assert.equal(this.oTable._oTable.getNoDataText(), this.oTable._getNoDataText());

				this.oTable.setNoDataText("another text");
				assert.equal(this.oTable._oTable.getNoDataText(), "another text");

				this.oTable.setNoDataText(null);
				assert.equal(this.oTable._oTable.getNoDataText(), this.oTable._getNoDataText());
				assert.equal(invalidateSpy.callCount, 0);

				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Header Visibility and Labelling", function(assert) {
		var done = assert.async();
		this.oTable.initialized().then(function() {
			var oTitle = this.oTable._oTitle;
			assert.ok(oTitle, "Title is available");
			assert.ok(!oTitle.getWidth(), "Title is shown");
			this.oTable.setHeaderVisible(false);
			assert.equal(oTitle.getWidth(), "0px", "Title is hidden due to width");

			assert.equal(this.oTable._oTable.getAriaLabelledBy().length, 1, "ARIA labelling available for inner table");
			assert.equal(this.oTable._oTable.getAriaLabelledBy()[0], oTitle.getId(), "ARIA labelling for inner table points to title");

			done();
		}.bind(this));
	});

	var fnRearrangeTest = function(iColumnIndexFrom, iColumnIndexTo) {
		return new Promise(function(resolve) {
			this.oTable.addColumn(new Column({
				dataProperty: "col0",
				header: "col0",
				template: new Text({
					text: "{col0}"
				})
			}));
			this.oTable.addColumn(new Column({
				dataProperty: "col1",
				header: "col1",
				template: new Text({
					text: "{col1}"
				})
			}));
			this.oTable.setP13nMode([
				"Column"
			]);
			this.oTable.bindRows({
				path: "/products"
			});

			Core.applyChanges();

			return this.oTable.initialized().then(function() {
				var aColumns = this.oTable.getColumns();
				var aInnerColumns = this.oTable._oTable.getColumns();

				Core.applyChanges();
				sap.ui.require([
					"sap/ui/mdc/TableDelegate"
				], function(TableDelegate) {

					sinon.stub(this.oTable, "getCurrentState").returns({
						items: [
							{
								"name": aColumns[0].getDataProperty(),
								"id": aColumns[0].getId(),
								"label": aColumns[0].getHeader()
							}, {
								"name": aColumns[1].getDataProperty(),
								"id": aColumns[1].getId(),
								"label": aColumns[1].getHeader()
							}
						],
						sorters: []
					});

					triggerDragEvent("dragstart", aInnerColumns[iColumnIndexFrom]);
					triggerDragEvent("dragenter", aInnerColumns[iColumnIndexTo]);
					triggerDragEvent("drop", aInnerColumns[iColumnIndexTo]);

					this.oTable.getCurrentState.restore();
					resolve();

				}.bind(this));
			}.bind(this));
		}.bind(this));

	};

	QUnit.test("rearrange columns", function(assert) {
		var done = assert.async();
		var fMoveColumnSpy = sinon.spy(TableSettings, "moveColumn");
		var fMoveItemSpy = sinon.spy(TableSettings, "_moveItem");
		//move from 0 --> 1
		fnRearrangeTest.bind(this)(0, 1).then(function() {
			assert.ok(fMoveColumnSpy.calledOnce);
			assert.ok(fMoveItemSpy.calledOnce);
			assert.ok(fMoveColumnSpy.calledWithExactly(this.oTable, 0, 1));
			fMoveColumnSpy.restore();
			fMoveItemSpy.restore();
			done();
		}.bind(this));
	});

	QUnit.test("rearrange columns (similar index) - no change should be created", function(assert) {
		var done = assert.async();
		var fMoveItemSpy = sinon.spy(TableSettings, "_moveItem");
		//move from 0 --> 0
		fnRearrangeTest.bind(this)(0, 0).then(function() {
			assert.ok(!fMoveItemSpy.calledOnce);
			fMoveItemSpy.restore();
			done();
		});
	});

	QUnit.test("Selection - GridTable", function(assert) {
		function selectItem(oRow, bUser) {
			if (bUser) {
				jQuery(oRow.getDomRefs().rowSelector).trigger("click");
				return;
			}
			oRow.getParent().getPlugins()[0].setSelectedIndex(oRow.getIndex(), true);
		}

		var done = assert.async();

		var oModel = new JSONModel();
		oModel.setData({
			testpath: [
				{}, {}, {}, {}, {}
			]
		});

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: "/testpath"
				}
			}
		});

		this.oTable.setModel(oModel);
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));

		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oTable.initialized().then(function() {
			this.oTable._oTable.attachEventOnce("_rowsUpdated", function() {
				var that = this;
				var oSelectionPlugin = this.oTable._oTable.getPlugins()[0];
				var iSelectionCount = -1;
				this.oTable.attachSelectionChange(function() {
					iSelectionCount = this.oTable.getSelectedContexts().length;
				}.bind(this));

				assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
				assert.ok(this.oTable._oTable.isBound("rows"));
				assert.equal(this.oTable._oTable.getBinding().getLength(), 5, "Items available");

				assert.equal(this.oTable.getSelectionMode(), "None", "Selection Mode None - MDCTable");
				assert.equal(this.oTable._oTable.getSelectionMode(), "None", "Selection Mode None - Inner Table");
				Core.applyChanges();

				Promise.resolve().then(function() {
					return new Promise(function(resolve) {
						selectItem(that.oTable._oTable.getRows()[0], false);
						Core.applyChanges();
						assert.equal(iSelectionCount, -1, "No selection change event");
						resolve();
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(that.oTable.getSelectedContexts().length, 1, "Item selected");
							assert.equal(iSelectionCount, 1, "Selection change event");
							resolve();
						});

						that.oTable.setSelectionMode("Single");
						assert.equal(that.oTable._oTable.getPlugins().length, 1, "Plugin available");
						assert.ok(that.oTable._oTable.getPlugins()[0].isA("sap.ui.table.plugins.MultiSelectionPlugin"), "Plugin is a MultiSelectionPlugin");
						assert.equal(that.oTable.getSelectionMode(), "Single", "Selection Mode Single - MDCTable");
						assert.equal(that.oTable._oTable.getPlugins()[0].getSelectionMode(), "Single", "Selection Mode Single - MultiSelectionPlugin");
						Core.applyChanges();

						selectItem(that.oTable._oTable.getRows()[0], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 1, "Selection change event");
							resolve();
						});
						selectItem(that.oTable._oTable.getRows()[1], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						iSelectionCount = -1;
						that.oTable.clearSelection();
						Core.applyChanges();

						assert.equal(iSelectionCount, -1, "No selection change event");
						assert.equal(that.oTable.getSelectedContexts().length, 0, "No Items selected");
						resolve();
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(that.oTable.getSelectedContexts().length, 1, "Item selected");
							assert.equal(iSelectionCount, 1, "Selection change event");
							resolve();
						});

						that.oTable.setSelectionMode("Multi");
						assert.equal(that.oTable.getSelectionMode(), "Multi", "Selection Mode Multi - MDCTable");
						assert.equal(that.oTable._oTable.getSelectionMode(), "MultiToggle", "Selection Mode Multi - Inner Table");
						Core.applyChanges();
						assert.equal(that.oTable._oTable.getPlugins().length, 1, "Plugin available");
						assert.ok(that.oTable._oTable.getPlugins()[0].isA("sap.ui.table.plugins.MultiSelectionPlugin"), "Plugin is a MultiSelectionPlugin");

						selectItem(that.oTable._oTable.getRows()[0], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 2, "Selection change event");
							resolve();
						});
						selectItem(that.oTable._oTable.getRows()[1], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 3, "Selection change event");
							resolve();
						});
						selectItem(that.oTable._oTable.getRows()[2], true);
					});
				}).then(function() {
					return new Promise(function(resolve) {
						iSelectionCount = -1;
						that.oTable.clearSelection();
						Core.applyChanges();

						assert.equal(iSelectionCount, -1, "No selection change event");
						assert.equal(that.oTable.getSelectedContexts().length, 0, "No Items selected");
						resolve();
					});
				}).then(function() {
					return new Promise(function(resolve) {
						// Simulate enable notification scenario via selection over limit
						that.oTable.setSelectionMode("Multi");
						var oSelectionPlugin = that.oTable._oTable.getPlugins()[0];

						// reduce limit to force trigger error
						that.oTable.setType(new GridTableType({
							selectionLimit: 3
						}));
						// check that notification is enabled
						assert.ok(oSelectionPlugin.getEnableNotification(), true);

						oSelectionPlugin.attachEventOnce("selectionChange", function() {
							assert.equal(iSelectionCount, 3, "Selection change event");
							assert.equal(that.oTable.getSelectedContexts().length, 3, "Items selected");
							resolve();
						});
						// select all existing rows
						oSelectionPlugin.setSelectionInterval(0, 4);
					});
				}).then(function() {
					done();
				});
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Selection - ResponsiveTable", function(assert) {
		function checkSelectionMethods(oTable) {
			var fInnerTablegetSelectedContextsSpy = sinon.spy(oTable._oTable, "getSelectedContexts");
			var fInnerTableclearSelectionSpy = sinon.spy(oTable._oTable, "removeSelections");

			assert.ok(fInnerTablegetSelectedContextsSpy.notCalled);
			oTable.getSelectedContexts();
			assert.ok(fInnerTablegetSelectedContextsSpy.calledOnce);
			assert.ok(fInnerTableclearSelectionSpy.notCalled);
			oTable.clearSelection();
			assert.ok(fInnerTableclearSelectionSpy.calledOnce);

			fInnerTablegetSelectedContextsSpy.restore();
			fInnerTableclearSelectionSpy.restore();
		}

		function selectItem(oItem, bUser) {
			if (bUser) {
				oItem.setSelected(true);
				oItem.informList("Select", true);
				return;
			}
			oItem.getParent().setSelectedItem(oItem, true);
		}

		var done = assert.async();

		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: "/testpath"
				}
			}
		});

		this.oTable.setType("ResponsiveTable");
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));
		var oModel = new JSONModel();
		oModel.setData({
			testpath: [
				{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}
			]
		});

		this.oTable.setModel(oModel);

		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();


		this.oTable.initialized().then(function() {
			// Initilaized has to be used again as the binding itself is done when the initialized Promise is fired
			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable.isA("sap.m.Table"));
				assert.ok(this.oTable._oTable.isBound("items"));
				assert.equal(this.oTable._oTable.getItems().length, 20, "Items available");

				var iSelectionCount = -1;
				this.oTable.attachSelectionChange(function() {
					iSelectionCount = this.oTable.getSelectedContexts().length;
				}.bind(this));

				assert.equal(this.oTable.getSelectionMode(), "None", "Selection Mode None - MDCTable");
				assert.equal(this.oTable._oTable.getMode(), "None", "Selection Mode None - Inner Table");
				Core.applyChanges();
				selectItem(this.oTable._oTable.getItems()[0], false);
				assert.equal(iSelectionCount, -1, "No selection change event");

				this.oTable.setSelectionMode("Multi");
				assert.equal(this.oTable.getSelectionMode(), "Multi", "Selection Mode Multi - MDCTable");
				assert.equal(this.oTable._oTable.getMode(), "MultiSelect", "Selection Mode Multi - Inner Table");
				Core.applyChanges();
				checkSelectionMethods(this.oTable);
				selectItem(this.oTable._oTable.getItems()[0], false);
				assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
				assert.equal(iSelectionCount, -1, "No selection change event");
				selectItem(this.oTable._oTable.getItems()[1], true);
				assert.equal(iSelectionCount, 2, "Selection change event");
				selectItem(this.oTable._oTable.getItems()[2], true);
				assert.equal(iSelectionCount, 3, "Selection change event");

				iSelectionCount = -1;
				this.oTable.clearSelection();
				assert.equal(iSelectionCount, -1, "No selection change event");
				assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

				this.oTable.setSelectionMode("Single");
				assert.equal(this.oTable.getSelectionMode(), "Single", "Selection Mode Single - MDCTable");
				assert.equal(this.oTable._oTable.getMode(), "SingleSelectLeft", "Selection Mode Single - Inner Table");
				Core.applyChanges();
				checkSelectionMethods(this.oTable);
				selectItem(this.oTable._oTable.getItems()[0], false);
				assert.equal(this.oTable.getSelectedContexts().length, 1, "Item selected");
				assert.equal(iSelectionCount, -1, "No selection change event");
				selectItem(this.oTable._oTable.getItems()[1], true);
				assert.equal(iSelectionCount, 1, "Selection change event");

				iSelectionCount = -1;
				this.oTable.clearSelection();
				assert.equal(iSelectionCount, -1, "No selection change event");
				assert.equal(this.oTable.getSelectedContexts().length, 0, "No Items selected");

				// Simulate message scenario via SelectAll
				sap.ui.require([
					"sap/m/MessageToast"
				], function(MessageToast) {
					var fMessageSpy = sinon.stub(MessageToast, "show");
					assert.ok(fMessageSpy.notCalled);

					this.oTable.setSelectionMode("Multi");
					this.oTable._oTable.selectAll(true);

					assert.equal(iSelectionCount, 20, "Selection change event");
					assert.equal(this.oTable.getSelectedContexts().length, 20, "Items selected");
					// message is shown delayed due to a require
					fMessageSpy.callsFake(function() {
						assert.ok(fMessageSpy.calledOnce);
						fMessageSpy.restore();
						done();
					});
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("ColumnHeaderPopover Sort - ResponsiveTable", function(assert) {
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");
		this.oTable.setType("ResponsiveTable");

		// Add a column with dataProperty
		this.oTable.addColumn(new Column({
			header: "test",
			dataProperty: "test",
			template: new Text()
		}));

		// Add a column without dataProperty (hence not sortable)
		this.oTable.addColumn(new Column({
			header: "test2",
			template: new Text()
		}));

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "test",
				label: "Test",
				path: "test"
			}
		]);

		this.oTable.initialized().then(function() {
			sap.ui.require([
				"sap/ui/mdc/table/TableSettings"
			], function(TableSettings) {
				var fSortSpy = sinon.spy(TableSettings, "createSort");

				assert.ok(this.oTable._oTable);
				assert.ok(this.oTable._oTable.bActiveHeaders, true);
				assert.ok(fColumnPressSpy.notCalled);

				var oInnerColumn = this.oTable._oTable.getColumns()[0];
				assert.ok(oInnerColumn.isA("sap.m.Column"));
				this.oTable._oTable.fireEvent("columnPress", {
					column: oInnerColumn
				});
				// Event triggered but no ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledOnce);
				assert.ok(!this.oTable._oPopover);

				this.oTable.setP13nMode([
					"Sort"
				]);

				this.oTable._oTable.fireEvent("columnPress", {
					column: oInnerColumn
				});

				// Event triggered and the ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledTwice);

				this.oTable.awaitPropertyHelper().then(function() {
					assert.ok(this.oTable._oPopover);
					assert.ok(this.oTable._oPopover.isA("sap.m.ColumnHeaderPopover"));

					var oSortItem = this.oTable._oPopover.getItems()[0];
					assert.ok(oSortItem.isA("sap.m.ColumnPopoverSortItem"));

					assert.ok(fSortSpy.notCalled);
					// Simulate Sort Icon press on ColumHeaderPopover
					oSortItem.fireSort({
						property: "foo"
					});
					// Event handler triggered
					assert.ok(fSortSpy.calledOnce);

					// Test for non-sortable column
					fColumnPressSpy.reset();
					delete this.oTable._oPopover;
					oInnerColumn = this.oTable._oTable.getColumns()[1];
					assert.ok(oInnerColumn.isA("sap.m.Column"));
					// Simulate click on non-sortable column
					this.oTable._oTable.fireEvent("columnPress", {
						column: oInnerColumn
					});

					// Event triggered but no ColumnHeaderPopover is created
					assert.ok(fColumnPressSpy.calledOnce);
					assert.ok(!this.oTable._oPopover);

					fSortSpy.restore();
					fColumnPressSpy.restore();
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("ColumnHeaderPopover Sort - GridTable", function(assert) {
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");

		// Add a column with dataProperty
		this.oTable.addColumn(new Column({
			header: "test",
			dataProperty: "test",
			template: new Text()
		}));

		// Add a column without dataProperty (hence not sortable)
		this.oTable.addColumn(new Column({
			header: "test2",
			template: new Text()
		}));

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "test",
				sortable: true
			}
		]);

		this.oTable.initialized().then(function() {
			sap.ui.require([
				"sap/ui/mdc/table/TableSettings"
			], function(TableSettings) {
				var fSortSpy = sinon.spy(TableSettings, "createSort");

				assert.ok(this.oTable._oTable);
				assert.ok(fColumnPressSpy.notCalled);

				var oInnerColumn = this.oTable._oTable.getColumns()[0];
				assert.ok(oInnerColumn.isA("sap.ui.table.Column"));
				this.oTable._oTable.fireEvent("columnSelect", {
					column: oInnerColumn
				});
				// Event triggered but no ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledOnce);
				assert.ok(!this.oTable._oPopover);

				this.oTable.setP13nMode([
					"Sort"
				]);


				// Simulate click on sortable column
				this.oTable._oTable.fireEvent("columnSelect", {
					column: oInnerColumn
				});
				// Event triggered and the ColumnHeaderPopover is created
				assert.ok(fColumnPressSpy.calledTwice);

				this.oTable.awaitPropertyHelper().then(function() {
					assert.ok(this.oTable._oPopover);
					assert.ok(this.oTable._oPopover.isA("sap.m.ColumnHeaderPopover"));

					var oSortItem = this.oTable._oPopover.getItems()[0];
					assert.ok(oSortItem.isA("sap.m.ColumnPopoverSortItem"));

					assert.ok(fSortSpy.notCalled);
					// Simulate Sort Icon press on ColumHeaderPopover
					oSortItem.fireSort({
						property: "foo"
					});
					// Event handler triggered
					assert.ok(fSortSpy.calledOnce);

					// Test for non-sortable column
					fColumnPressSpy.reset();
					delete this.oTable._oPopover;
					oInnerColumn = this.oTable._oTable.getColumns()[1];
					assert.ok(oInnerColumn.isA("sap.ui.table.Column"));
					// Simulate click on non-sortable column
					this.oTable._oTable.fireEvent("columnSelect", {
						column: oInnerColumn
					});

					// Event triggered but no ColumnHeaderPopover is created
					assert.ok(fColumnPressSpy.calledOnce);
					assert.ok(!this.oTable._oPopover);

					fSortSpy.restore();
					fColumnPressSpy.restore();
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("No ColumnHeaderPopover for NonSortable property", function(assert) {
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");

		// Add a column with dataProperty
		this.oTable.addColumn(new Column({
			header: "test",
			dataProperty: "test",
			template: new Text()
		}));

		// Add a column without dataProperty (hence not sortable)
		this.oTable.addColumn(new Column({
			header: "test2",
			template: new Text()
		}));

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "test",
				sortable: false
			}
		]);

		this.oTable.initialized().then(function() {
			sap.ui.require([
				"sap/ui/mdc/table/TableSettings"
			], function(TableSettings) {
				var oInnerColumn = this.oTable._oTable.getColumns()[0];

				this.oTable.setP13nMode([
					"Sort"
				]);


				// Simulate click on sortable column
				this.oTable._oTable.fireEvent("columnSelect", {
					column: oInnerColumn
				});

				this.oTable.awaitPropertyHelper().then(function() {
					assert.ok(!this.oTable._oPopover, "No ColumnHeaderPopover as for NonSortable Property");
					fColumnPressSpy.restore();
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Only provided sortable properties in the ColumnHeaderPopover", function(assert) {
		var done = assert.async();
		var fColumnPressSpy = sinon.spy(this.oTable, "_onColumnPress");

		// Add a column with complexProperty: 1 sortable and 1 non-sortable
		this.oTable.addColumn(new Column({
			header: "test",
			dataProperty: "testComplex",
			template: new Text()
		}));

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "test",
				sortable: false
			}, {
				name: "test2",
				sortable: true
			}, {
				name: "testComplex",
				propertyInfos: ["test", "test2"]
			}
		]);

		this.oTable.initialized().then(function() {
			sap.ui.require([
				"sap/ui/mdc/table/TableSettings"
			], function(TableSettings) {
				var oInnerColumn = this.oTable._oTable.getColumns()[0];

				this.oTable.setP13nMode([
					"Sort"
				]);


				// Simulate click on sortable column
				this.oTable._oTable.fireEvent("columnSelect", {
					column: oInnerColumn
				});

				this.oTable.awaitPropertyHelper().then(function() {
					assert.ok(this.oTable._oPopover);
					assert.strictEqual(this.oTable._oPopover.getItems().length, 1, "Sort item button created");
					var aSortItem = this.oTable._oPopover.getItems()[0].getItems();
					assert.strictEqual(aSortItem.length, 1, "Sort item button created");
					assert.strictEqual(aSortItem[0].getText(), "test2", "Sortable dataProperty added as sort item");
					fColumnPressSpy.restore();
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Multiple Tables with different type - Columns added simultaneously to inner tables", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		var oTable2 = new Table({
			type: "ResponsiveTable"
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		this.oTable.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		oTable2.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			}),
			creationTemplate: new Text({
				text: "Test"
			})
		}));
		oTable2.insertColumn(new Column({
			header: "Test2",
			template: new Text({
				text: "Test2"
			})
		}), 0);

		Promise.all([
			this.oTable.initialized(), oTable2.initialized()
		]).then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(oTable2._oTable);
			assert.ok(oTable2._oTemplate);

			this.oTable.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			oTable2.addColumn(new Column({
				header: "Test3",
				template: new Text({
					text: "Test3"
				})
			}));

			var aMDCColumns = this.oTable.getColumns();
			var aInnerColumns = this.oTable._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getLabel().getText());
			assert.equal(aInnerColumns[0].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[0].getLabel().getText(), "Test2", "column0: label is correct");
			assert.equal(aInnerColumns[1].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[1].getLabel().getText(), "Test", "column1: label is correct");
			assert.equal(aInnerColumns[2].isA("sap.ui.table.Column"), true);
			assert.equal(aInnerColumns[2].getLabel().getText(), "Test3", "column1: label is correct");
			assert.equal(aInnerColumns[0].getTemplate().getText(), "Test2", "column0: template is correct");
			assert.equal(aInnerColumns[0].getTemplate().getWrapping(), false, "column0: template wrapping is disabled");
			assert.equal(aInnerColumns[0].getTemplate().getRenderWhitespace(), false, "column0: template renderWhitespace is disabled");
			assert.equal(aInnerColumns[1].getTemplate().getText(), "Test", "column1: template is correct");
			assert.equal(aInnerColumns[0].getCreationTemplate(), null, "column0: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getText(), "Test", "column1: creationTemplate is correct");
			assert.equal(aInnerColumns[1].getCreationTemplate().getWrapping(), false, "column1: creationTemplate wrapping is disabled");
			assert.equal(aInnerColumns[1].getCreationTemplate().getRenderWhitespace(), false, "column1: creationTemplate renderWhitespace is disabled");

			aMDCColumns = oTable2.getColumns();
			aInnerColumns = oTable2._oTable.getColumns();
			assert.equal(aMDCColumns.length, aInnerColumns.length);
			assert.equal(aMDCColumns[0].getHeader(), aInnerColumns[0].getHeader().getText());
			assert.equal(aInnerColumns[0].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[0].getHeader().getText(), "Test2", "column0: label is correct");
			assert.equal(aInnerColumns[0].getHeader().getWrapping(), true);
			assert.equal(aInnerColumns[0].getHeader().getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[1].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[1].getHeader().getText(), "Test", "column1: label is correct");
			assert.equal(aInnerColumns[1].getHeader().getWrapping(), true);
			assert.equal(aInnerColumns[1].getHeader().getWrappingType(), "Hyphenated");
			assert.equal(aInnerColumns[2].isA("sap.m.Column"), true);
			assert.equal(aInnerColumns[2].getHeader().getText(), "Test3", "column1: label is correct");
			assert.equal(aInnerColumns[2].getHeader().getWrapping(), true);
			assert.equal(aInnerColumns[2].getHeader().getWrappingType(), "Hyphenated");

			done();
		}.bind(this));
	});

	QUnit.test("RowPress event test", function(assert) {
		function checkRowPress(bIsMTable, oTable, oRow) {
			var fRowPressSpy = sinon.spy(oTable, "fireRowPress");

			assert.ok(fRowPressSpy.notCalled);
			if (bIsMTable) {
				oTable._oTable.fireItemPress({
					listItem: oRow
				});
			} else {
				oTable._oTable.fireCellClick({
					rowBindingContext: oRow.getBindingContext()
				});
			}
			assert.ok(fRowPressSpy.calledOnce);

			fRowPressSpy.restore();
			return true;
		}

		function checkRowActionPress(oTable, oRow) {
			var oRowAction = oTable._oTable.getRowActionTemplate();
			if (!oRowAction) {
				return false;
			}
			var oRowActionItem = oRowAction.getItems()[0];
			if (!oRowActionItem) {
				return false;
			}

			var fRowPressSpy = sinon.spy(oTable, "fireRowPress");

			assert.ok(fRowPressSpy.notCalled);
			oRowActionItem.firePress({
				row: oRow
			});
			assert.ok(fRowPressSpy.calledOnce);

			fRowPressSpy.restore();
			return true;
		}

		var done = assert.async();
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: "/testpath"
				}
			}
		});

		this.oTable.setType("ResponsiveTable");
		this.oTable.addColumn(new Column({
			header: "test",
			template: new Text()
		}));
		var oModel = new JSONModel();
		oModel.setData({
			testpath: [
				{}, {}, {}, {}, {}
			]
		});
		this.oTable.setModel(oModel);

		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();


		this.oTable.initialized().then(function() {
			// Initilaized has to be used again as the binding itself is done when the initialized Promise is fired
			this.oTable.initialized().then(function() {
				assert.ok(this.oTable._oTable.isA("sap.m.Table"));
				assert.ok(checkRowPress(true, this.oTable, this.oTable._oTable.getItems()[0]));
				this.oTable.setType("Table");
				this.oTable.initialized().then(function() {
					assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"));
					this.oTable._oTable.attachEventOnce("_rowsUpdated", function() {
						assert.ok(checkRowPress(false, this.oTable, this.oTable._oTable.getRows()[0]));
						// no row action present
						assert.ok(!checkRowActionPress(this.oTable));

						this.oTable.setRowAction([
							"Navigation"
						]);
						// row action triggers same rowPress event
						assert.ok(checkRowActionPress(this.oTable, this.oTable._oTable.getRows()[1]));
						done();
					}, this);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("MultiSelectionPlugin", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			var oMultiSelectionPlugin = this.oTable._oTable.getPlugins()[0];
			assert.ok(oMultiSelectionPlugin, "MultiSelectionPlugin is initialized");

			assert.equal(oMultiSelectionPlugin.getLimit(), 200, "default selection limit is correct");
			assert.ok(oMultiSelectionPlugin.getShowHeaderSelector(), "default value showHeaderSelector is correct");
			this.oTable.setType(new GridTableType({
				selectionLimit: 20,
				showHeaderSelector: false
			}));
			assert.equal(this.oTable.getType().getSelectionLimit(), 20, "selection limit is updated");
			assert.equal(oMultiSelectionPlugin.getLimit(), 20, "MultiSelectionPlugin.limit is updated");
			assert.ok(!this.oTable.getType().getShowHeaderSelector(), "showHeaderSelector is updated");
			assert.ok(!oMultiSelectionPlugin.getShowHeaderSelector(), "MultiSelectionPlugin.showHeaderSelector is updated");
			done();
		}.bind(this));
	});


	QUnit.test("Table with FilterBar", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);
		// disable autoBind for this test as this is not relevant
		this.oTable.setAutoBindOnInit(false);
		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			// simulate table is bound already
			var fStub = this.stub(this.oTable._oTable, "isBound");
			fStub.withArgs("rows").returns(true);
			var fBindRowsStub = this.stub(this.oTable._oTable, "bindRows");
			this.oTable.setRowsBindingInfo({
				"path": "foo"
			});

			sap.ui.require([
				"sap/ui/mdc/FilterBar", "sap/ui/core/Control"
			], function(FilterBar, Control) {
				// Test with FilterBar
				var oFilter = new FilterBar();
				this.oTable.setFilter(oFilter);
				var fGetConditionsSpy = this.spy(oFilter, "getConditions");

				assert.strictEqual(this.oTable.getFilter(), oFilter.getId());
				assert.strictEqual(this.oTable._oTable.getShowOverlay(), false);
				assert.ok(fGetConditionsSpy.notCalled);
				assert.ok(fBindRowsStub.notCalled);

				// simulate filtersChanged event
				oFilter.fireFiltersChanged();

				assert.strictEqual(this.oTable._oTable.getShowOverlay(), false);
				assert.ok(fGetConditionsSpy.notCalled);
				assert.ok(fBindRowsStub.notCalled);

				// simulate filtersChanged event
				oFilter.fireFiltersChanged({conditionsBased: false});

				assert.strictEqual(this.oTable._oTable.getShowOverlay(), false);
				assert.ok(fGetConditionsSpy.notCalled);
				assert.ok(fBindRowsStub.notCalled);

				// simulate filtersChanged event
				oFilter.fireFiltersChanged({conditionsBased: true});

				assert.strictEqual(this.oTable._oTable.getShowOverlay(), true);
				assert.ok(fGetConditionsSpy.notCalled);
				assert.ok(fBindRowsStub.notCalled);

				// simulate search event
				oFilter.fireSearch();

				assert.strictEqual(this.oTable._oTable.getShowOverlay(), false);
				assert.ok(fGetConditionsSpy.calledOnce);
				assert.ok(fBindRowsStub.calledOnce);

				// Test with empty
				this.oTable.setFilter();

				assert.ok(!this.oTable.getFilter());

				// Test with invalid control
				assert.throws(function() {
					this.oTable.setFilter(new Control());
				}.bind(this), function(oError) {
					return oError instanceof Error && oError.message.indexOf("sap.ui.mdc.IFilter") > 0;
				});
				assert.ok(!this.oTable.getFilter());

				// Finish
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("noDataText - Table with FilterBar and not bound", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		this.oTable.setAutoBindOnInit(false);

		this.oTable.initialized().then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");

			sap.ui.require([
				"sap/ui/mdc/FilterBar"
			], function(FilterBar) {
				var oFilter = new FilterBar();
				this.oTable.setFilter(oFilter);
				assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA_WITH_FILTERBAR"), "'To start, set the relevant filters.' is displayed");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("noDataText - Table with FilterBar and bound", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);

		this.oTable.initialized().then(function() {
			// Initilaized has to be used again as the binding itself is done when the initialized Promise is fired
			this.oTable.initialized().then(function() {
				var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");

				sap.ui.require([
					"sap/ui/mdc/FilterBar"
				], function(FilterBar) {
					var oFilter = new FilterBar();
					this.oTable.setFilter(oFilter);
					assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_RESULTS"), "'No data found. Try adjusting the filter settings.' is displayed");
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("noDataText - Table without FilterBar and not bound", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		this.oTable.setAutoBindOnInit(false);

		this.oTable.initialized().then(function() {
			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
			assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_DATA"), "'No items available.' is displayed");
			done();
		}.bind(this));
	});

	QUnit.test("noDataText - Table without FilterBar and bound", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.initialized().then(function() {
			// Initilaized has to be used again as the binding itself is done when the initialized Promise is fired
			this.oTable.initialized().then(function() {
				var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");
				assert.strictEqual(this.oTable._oTable.getNoData(), oRb.getText("table.NO_RESULTS"), "'No data found. Try adjusting the filter settings.' is displayed");
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Table with VariantManagement and QuickFilter", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oToolbar);

			sap.ui.require([
				"sap/ui/fl/variants/VariantManagement", "sap/m/SegmentedButton", "sap/ui/core/Control"
			], function(VariantManagement, SegmentedButton, Control) {
				// Test with VariantManagement
				var oVariant = new VariantManagement(),
					oVariant2 = new VariantManagement(),
					oQuickFilter = new SegmentedButton(),
					oQuickFilter2 = new SegmentedButton();

				// Test Variant exists on toolbar
				this.oTable.setVariant(oVariant);
				assert.strictEqual(this.oTable.getVariant(), oVariant);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test with setting same Variant on toolbar
				this.oTable.setVariant(oVariant);
				assert.strictEqual(this.oTable.getVariant(), oVariant);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test Variant has been changed on toolbar
				this.oTable.setVariant(oVariant2);
				assert.strictEqual(this.oTable.getVariant(), oVariant2);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant2]);

				// Test with empty Variant
				this.oTable.setVariant(oVariant2);
				this.oTable.setVariant();
				assert.ok(!this.oTable.getVariant());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with VariantManagement and QuickFilter
				this.oTable.setVariant(oVariant);
				this.oTable.setQuickFilter(oQuickFilter);
				assert.strictEqual(this.oTable.getQuickFilter(), oQuickFilter);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant, oQuickFilter]);

				// Test with only QuickFilter
				this.oTable.setVariant();
				assert.ok(!this.oTable.getVariant());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oQuickFilter]);

				// Test with empty
				this.oTable.setQuickFilter();
				assert.ok(!this.oTable.getQuickFilter());
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with different QuickFilters
				this.oTable.setVariant(oVariant);
				this.oTable.setQuickFilter(oQuickFilter);
				this.oTable.setQuickFilter(oQuickFilter2);
				assert.strictEqual(this.oTable.getQuickFilter(), oQuickFilter2);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant, oQuickFilter2]);

				// Test destroying QuickFilter
				this.oTable.setQuickFilter(oQuickFilter);
				this.oTable.destroyQuickFilter();
				assert.ok(!this.oTable.getQuickFilter());
				assert.ok(oQuickFilter.bIsDestroyed);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), [oVariant]);

				// Test destroying Variant
				this.oTable.destroyVariant();
				assert.ok(!this.oTable.getVariant());
				assert.ok(oVariant.bIsDestroyed);
				assert.deepEqual(this.oTable._oToolbar.getBetween(), []);

				// Test with invalid control for Variant
				assert.throws(function() {
					this.oTable.setVariant(new Control());
				}.bind(this), function(oError) {
					return oError instanceof Error && oError.message.indexOf("variant") > 0;
				});
				assert.ok(!this.oTable.getVariant());

				// Cleanup
				oVariant2.destroy();
				oQuickFilter2.destroy();

				// Finish
				done();
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("Table busy state", function(assert) {
		var done = assert.async();

		assert.ok(this.oTable, "sap.ui.mdc.Table initialized");
		assert.ok(!this.oTable._oTable, "No inner table available");

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable, "Inner table initialized");

			assert.notOk(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is false");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state is false");

			this.oTable.setBusy(true);
			assert.ok(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is true");
			assert.ok(this.oTable._oTable.getBusy(), "Inner table busy state is true");

			this.oTable._oTable.setBusy(false);
			assert.ok(this.oTable.getBusy(), "sap.ui.mdc.Table busy state remains true");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state changed independently");

			this.oTable.setBusy(false);
			assert.notOk(this.oTable.getBusy(), "sap.ui.mdc.Table busy state is false");
			assert.notOk(this.oTable._oTable.getBusy(), "Inner table busy state is false");

			assert.strictEqual(this.oTable.getBusyIndicatorDelay(), 100, "sap.ui.mdc.Table - Default Busy Indicator Delay");
			assert.strictEqual(this.oTable._oTable.getBusyIndicatorDelay(), 100, "Inner table - Default Busy Indicator Delay");
			this.oTable.setBusyIndicatorDelay(200);
			assert.strictEqual(this.oTable.getBusyIndicatorDelay(), 200, "sap.ui.mdc.Table - Custom Busy Indicator Delay");
			assert.strictEqual(this.oTable._oTable.getBusyIndicatorDelay(), 200, "Inner table - Custom Busy Indicator Delay");
			done();
		}.bind(this));
	});

	QUnit.test("enableExport property & export button test", function(assert) {
		var done = assert.async();

		assert.ok(this.oTable, "sap.ui.mdc.Table initialized");
		assert.notOk(this.oTable.getEnableExport(), "default property value enableExport=false");

		this.oTable.setEnableExport(true);
		Core.applyChanges();
		assert.ok(this.oTable.getEnableExport(), "enableExport=true");

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			assert.ok(this.oTable._oToolbar);
			assert.ok(this.oTable._oExportButton, "Export button created");
			assert.ok(this.oTable._oExportButton.isA("sap.m.MenuButton"), "Export button is a sap.m.MenuButton");
			done();
		}.bind(this));
	});

	QUnit.test("trigger export - no visible columns", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable, "sap.ui.mdc.Table initialized");

		this.oTable.setEnableExport(true);
		Core.applyChanges();
		assert.ok(this.oTable.getEnableExport(), "enableExport=true");

		this.oTable.initialized().then(function() {
			// Initilaized has to be used again as the binding itself is done when the initialized Promise is fired
			this.oTable.initialized().then(function() {
				assert.strictEqual(this.oTable.getColumns().length, 0, "No columns in the table");
				assert.ok(this.oTable._oExportButton, "Export button is created");
				var fnOnExport = sinon.spy(this.oTable, "_onExport");
				sap.ui.require([
					"sap/m/MessageBox"
				], function(MessageBox) {
					sinon.stub(MessageBox, "error").callsFake(function() {
						assert.ok(fnOnExport.calledOnce, "_onExport called");
						assert.ok(MessageBox.error.calledOnce);
						MessageBox.error.restore();
						done();
					});
					this.oTable._oExportButton.fireDefaultAction();
					Core.applyChanges();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("test Export as...", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable, "sap.ui.mdc.Table initialized");
		sinon.stub(this.oTable, "_onExportAs");

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			this.oTable.setEnableExport(true);
			Core.applyChanges();
			assert.ok(this.oTable.getEnableExport(), "enableExport=true");
			assert.ok(this.oTable._oExportButton);
			sap.ui.getCore().loadLibrary("sap.ui.unified", {async: true}).then(function() { // do the same async steps as the Table to load unified lib and Menu, so the Menu is available in the next checks
				sap.ui.require(["sap/m/Menu", "sap/m/MenuItem"], function(/* Menu, MenuItem */) {
					this.oTable._oExportButton.getMenu().getItems()[1].firePress();
					assert.ok(this.oTable._onExportAs.calledOnce, "_onExportAs called");
					this.oTable._onExportAs.restore();
					done();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	});

	QUnit.test("test Export as... via keyboard shortcut", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable, "sap.ui.mdc.Table initialized");

		var sPath = "/foo";
		this.oTable.bindRows({
			path: sPath
		});

		sinon.stub(this.oTable, "_onExportAs");

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);
			this.oTable.setEnableExport(true);
			Core.applyChanges();
			assert.ok(this.oTable.getEnableExport(), "enableExport=true");
			assert.ok(this.oTable._oExportButton);
			assert.notOk(this.oTable.getRowBinding(), "no binding so no binding length");
			assert.notOk(this.oTable._oExportButton.getEnabled(), "Button is disabled as binding length is 0");

			// trigger CTRL + SHIFT + E keyboard shortcut
			QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.E, true, false, true);
			assert.ok(this.oTable._onExportAs.notCalled, "Export button is disabled");

			this.oTable._oExportButton.setEnabled(true);
			Core.applyChanges();
			// trigger CTRL + SHIFT + E keyboard shortcut
			QUtils.triggerKeydown(this.oTable.getDomRef(), KeyCodes.E, true, false, true);
			assert.ok(this.oTable._onExportAs.called, "Export settings dialog opened");
			done();
		}.bind(this));
	});

	QUnit.test("test _createExportColumnConfiguration", function(assert) {
		var done = assert.async();

		var sCollectionPath = "/foo";
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: sCollectionPath
				}
			}
		});

		assert.ok(this.oTable, "sap.ui.mdc.Table initialized");

		this.oTable.setEnableExport(true);
		Core.applyChanges();
		assert.ok(this.oTable.getEnableExport(), "enableExport=true");

		this.oTable.addColumn(new Column({
			id: "firstNameColumn",
			header: "First name",
			width: "10rem",
			dataProperty: "firstName",
			template: new Text({
				text: "{firstName}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "lastNameColumn",
			header: "Last name",
			width: "10rem",
			dataProperty: "lastName",
			template: new Text({
				text: "{lastName}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "fullName",
			header: "Full name",
			width: "15rem",
			dataProperty: "fullName",
			template: new Text({
				text: "{lastName}, {firstName}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "fullNameExportSettings",
			header: "Full name 2",
			width: "15rem",
			dataProperty: "fullName2",
			template: new Text({
				text: "{lastName}, {firstName}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "ageColumn",
			header: "Age",
			hAlign: "Right",
			width: "8rem",
			dataProperty: "age",
			template: new Text({
				text: "{age}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "dobColumn",
			header: "Date of Birth",
			hAlign: "Right",
			width: "12rem",
			dataProperty: "dob",
			template: new Text({
				text: "{dob}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "salaryColumn",
			header: "Salary",
			hAlign: "Right",
			width: "12rem",
			dataProperty: "salary",
			template: new Text({
				text: "{salary}"
			})
		}));

		var aExpectedOutput = [
			{
				columnId: "firstNameColumn",
				property: "firstName",
				type: "String",
				label: "First_Name",
				width: 19,
				textAlign: "Begin"
			},
			{
				columnId: "lastNameColumn",
				property: "lastName",
				type: "String",
				label: "Last name",
				width: 10,
				textAlign: "Begin",
				displayUnit: true
			},
			{
				columnId: "fullName",
				label: "First_Name",
				property: "firstName",
				textAlign: "Begin",
				type: "String",
				width: 19
			},
			{
				columnId: "fullName-additionalProperty1",
				label: "Last name",
				property: "lastName",
				textAlign: "Begin",
				type: "String",
				width: 15
			},
			{
				columnId: "fullNameExportSettings",
				label: "Name",
				property: ["firstName", "lastName"],
				template: "{0}, {1}",
				textAlign: "Begin",
				type: "String",
				width: 15
			},
			{
				columnId: "ageColumn",
				property: "age",
				type: "Number",
				label: "Age",
				width: 8,
				textAlign: "Right"
			},
			{
				columnId: "dobColumn",
				property: "dob",
				type: "Date",
				label: "Date of Birth",
				width: 15,
				textAlign: "Right",
				template: "{0}",
				inputFormat: "YYYYMMDD"
			},
			{
				columnId: "salaryColumn",
				displayUnit: true,
				label: "Salary",
				property: "salary",
				template: "{0} {1}",
				textAlign: "Right",
				unitProperty: "currency",
				width: 10,
				type: "Currency"
			}
		];

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "firstName",
				path: "firstName",
				label: "First name",
				exportSettings: {
					width: 19,
					type: "String",
					label: "First_Name"
				}
			}, {
				name: "lastName",
				path: "lastName",
				label: "Last name"
			}, {
				name: "fullName", // complex PropertyInfo without exportSettings => 2 spreadsheet column configs will be created
				label: "Full name",
				propertyInfos: ["firstName", "lastName"]
			}, {
				name: "fullName2", // complex PropertyInfo withexportSettings => 1 spreadsheet column config will be created
				label: "Name",
				propertyInfos: ["firstName", "lastName"],
				exportSettings: {
					template: "{0}, {1}"
				}
			}, {
				name: "age",
				path: "age",
				label: "Age",
				exportSettings: {
					type: "Number"
				}
			}, {
				name: "dob",
				path: "dob",
				exportSettings: {
					label: "Date of Birth",
					type: "Date",
					inputFormat: "YYYYMMDD",
					width: 15,
					template: "{0}"
				}
			}, {
				name: "salary",
				path: "salary",
				label: "Salary",
				exportSettings: {
					displayUnit: true,
					unitProperty: "currency",
					template: "{0} {1}",
					width: 10,
					type: "Currency"
				}
			}, {
				name: "currency",
				path: "currency",
				label: "Currency code",
				exportSettings: {
					width: 5
				}
			}
		]);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);

			this.oTable._createExportColumnConfiguration({fileName: 'Table header'}).then(function(aActualOutput) {
				assert.deepEqual(aActualOutput[0], aExpectedOutput, "The export configuration was created as expected");
				done();
			});
		}.bind(this));
	});

	QUnit.test("test _createExportColumnConfiguration with split cells", function(assert) {
		var done = assert.async();

		var sCollectionPath = "/foo";
		this.oTable.destroy();
		this.oTable = new Table({
			delegate: {
				name: "sap/ui/mdc/TableDelegate",
				payload: {
					collectionPath: sCollectionPath
				}
			}
		});

		assert.ok(this.oTable, "sap.ui.mdc.Table initialized");

		this.oTable.setEnableExport(true);
		Core.applyChanges();
		assert.ok(this.oTable.getEnableExport(), "enableExport=true");

		this.oTable.addColumn(new Column({
			id: "product",
			header: "Product",
			width: "10rem",
			dataProperty: "product",
			template: new Text({
				text: "{products}"
			})
		}));

		this.oTable.addColumn(new Column({
			id: "price",
			header: "Price",
			width: "8rem",
			hAlign: "Right",
			dataProperty: "price",
			template: new Text({
				text: "{price} {currencyCode}"
			})
		}));

		// column with complex propertyInfo
		this.oTable.addColumn(new Column({
			id: "company",
			header: "Company",
			width: "10rem",
			dataProperty: "company",
			template: new Text({
				text: "{companyName} ({companyCode})"
			})
		}));

		var aExpectedOutput = [
			{
				columnId: "product",
				property: "product",
				type: "String",
				label: "Product",
				width: 10,
				textAlign: "Begin",
				displayUnit: false
			},
			{
				columnId: "price",
				property: "price",
				displayUnit: false,
				type: "Currency",
				label: "Price",
				width: 8,
				textAlign: "Right",
				unitProperty: "currencyCode"
			},
			{
				columnId: "price-additionalProperty",
				label: "Currency Code",
				property: "currencyCode",
				type: "String",
				width: 4,
				textAlign: "Left"
			},
			{
				columnId: "company",
				label: "Company Name",
				property: "companyName",
				textAlign: "Begin",
				type: "String",
				width: 15
			},
			{
				columnId: "company-additionalProperty1",
				label: "Company Code",
				property: "companyCode",
				textAlign: "Begin",
				type: "String",
				width: 10
			}
		];

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "product",
				path: "product",
				label: "Product"
			}, {
				name: "price",
				path: "price",
				label: "Price",
				exportSettings: {
					label: "Price",
					displayUnit: true,
					unitProperty: "currencyCode",
					type: "Currency"
				}
			}, {
				name: "currencyCode",
				path: "currencyCode",
				label: "Currency Code",
				exportSettings: {
					width: 4,
					textAlign: "Left"
				}
			}, {
				name: "company",
				label: "Company Name",
				propertyInfos: ["companyName", "companyCode"]
			}, {
				name: "companyName",
				label: "Company Name",
				exportSettings: {
					width: 15
				}
			}, {
				name: "companyCode",
				label: "Company Code"
			}
		]);

		this.oTable.initialized().then(function() {
			assert.ok(this.oTable._oTable);

			this.oTable._createExportColumnConfiguration({fileName: 'Table header', splitCells: true}).then(function(aActualOutput) {
				assert.deepEqual(aActualOutput[0], aExpectedOutput, "The export configuration was created as expected");
				done();
			});
		}.bind(this));
	});

	QUnit.test("Focus Function", function(assert) {
		var done = assert.async();
		assert.ok(this.oTable);
		assert.ok(!this.oTable._oTable);

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		var oButton = new Button();
		this.oTable.addAction(oButton);

		this.oTable.initialized().then(function() {

			Core.applyChanges();

			assert.ok(this.oTable._oTable.getDomRef());

			assert.ok(!containsOrEquals(this.oTable.getDomRef(), document.activeElement));
			this.oTable.focus();
			assert.ok(containsOrEquals(this.oTable._oTable.getDomRef(), document.activeElement));
			oButton.focus();
			assert.ok(oButton.getFocusDomRef() === document.activeElement);
			this.oTable.focus();
			assert.ok(oButton.getFocusDomRef() === document.activeElement);

			done();
		}.bind(this));

	});

	QUnit.test("test scrollToIndex", function(assert) {
		var done = assert.async(), oTableStub, oTable = this.oTable;

		assert.ok(oTable, "sap.ui.mdc.Table initialized");

		oTable.initialized().then(function() {
			var iBindingLength = oTable._oTable.getBinding('rows') ? oTable._oTable.getBinding('rows').getLength() : 0,
				iIndex;

			oTableStub = sinon.stub(oTable._oTable, "setFirstVisibleRow");
			assert.notOk(oTableStub.called, "setFirstVisibleRow was not called yet");

			iIndex = 0;
			oTable.scrollToIndex(iIndex);
			assert.ok(oTableStub.called, "setFirstVisibleRow was called");
			assert.ok(oTableStub.calledOnce, "setFirstVisibleRow was called only once");
			assert.ok(oTableStub.calledWith(iIndex), "setFirstVisibleRow was called with the correct parameter");

			iIndex = 5;
			oTable.scrollToIndex(iIndex);
			assert.ok(oTableStub.calledTwice, "setFirstVisibleRow was called a second time");
			assert.ok(oTableStub.calledWith(iIndex), "setFirstVisibleRow was called with the correct parameter");

			iIndex = -1;
			oTable.scrollToIndex(iIndex);
			assert.ok(oTableStub.calledThrice, "setFirstVisibleRow was called a third time");
			assert.ok(oTableStub.calledWith(iBindingLength), "setFirstVisibleRow was called with the correct parameter");

			iIndex = 10000;
			oTable.scrollToIndex(iIndex);
			assert.ok(oTableStub.callCount === 4, "setFirstVisibleRow was called a fourth time");
			assert.ok(oTableStub.calledWith(iIndex), "setFirstVisibleRow was called with the correct parameter");

			oTableStub.restore();

			oTable.setType("ResponsiveTable").initialized().then(function() {

				oTableStub = sinon.stub(oTable._oTable, "scrollToIndex");
				assert.notOk(oTableStub.called, "scrollToIndex was not called yet");

				iIndex = 0;
				oTable.scrollToIndex(iIndex);
				assert.ok(oTableStub.called, "scrollToIndex was called");
				assert.ok(oTableStub.calledOnce, "scrollToIndex was called only once");
				assert.ok(oTableStub.calledWith(iIndex), "scrollToIndex was called with the correct parameter");

				iIndex = 5;
				oTable.scrollToIndex(iIndex);
				assert.ok(oTableStub.calledTwice, "scrollToIndex was called a second time");
				assert.ok(oTableStub.calledWith(iIndex), "scrollToIndex was called with the correct parameter");

				iIndex = -1;
				oTable.scrollToIndex(iIndex);
				assert.ok(oTableStub.calledThrice, "scrollToIndex was called a third time");
				assert.ok(oTableStub.calledWith(iIndex), "scrollToIndex was called with the correct parameter");

				iIndex = 10000;
				oTable.scrollToIndex(iIndex);
				assert.ok(oTableStub.callCount === 4, "scrollToIndex was called a fourth time");
				assert.ok(oTableStub.calledWith(iIndex), "scrollToIndex was called with the correct parameter");

				oTableStub.restore();

				done();
			});
		});
	});

	QUnit.test("Paste with a grid table", function(assert) {
		var done = assert.async();

		var fPasteHandler = function(oEvent) {
			var aData = oEvent.getParameter("data");
			assert.ok(Array.isArray(aData));
			assert.ok(aData.length === 2);

			assert.ok(Array.isArray(aData[0]));
			assert.ok(aData[0].length === 3);
			assert.ok(aData[0][0] === "111");
			assert.ok(aData[0][1] === "222");
			assert.ok(aData[0][2] === "333");

			assert.ok(Array.isArray(aData[1]));
			assert.ok(aData[1].length === 3);
			assert.ok(aData[1][0] === "aaa");
			assert.ok(aData[1][1] === "bbb");
			assert.ok(aData[1][2] === "ccc");

			done();
		};

		this.oTable.attachPaste(fPasteHandler);
		this.oTable.initialized().then(function() {
			var oInnerTable = this.oTable._oTable;
			oInnerTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});
		}.bind(this));
	});

	QUnit.test("Paste with a responsive table", function(assert) {
		var done = assert.async();

		// Destroy the default grid table and create a new responsive one
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});
		// place the table at the dom
		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		var fPasteHandler = function(oEvent) {
			var aData = oEvent.getParameter("data");
			assert.ok(Array.isArray(aData));
			assert.ok(aData.length === 2);

			assert.ok(Array.isArray(aData[0]));
			assert.ok(aData[0].length === 3);
			assert.ok(aData[0][0] === "111");
			assert.ok(aData[0][1] === "222");
			assert.ok(aData[0][2] === "333");

			assert.ok(Array.isArray(aData[1]));
			assert.ok(aData[1].length === 3);
			assert.ok(aData[1][0] === "aaa");
			assert.ok(aData[1][1] === "bbb");
			assert.ok(aData[1][2] === "ccc");

			done();
		};

		this.oTable.attachPaste(fPasteHandler);
		this.oTable.initialized().then(function() {
			var oInnerTable = this.oTable._oTable;
			oInnerTable.firePaste({data: [["111", "222", "333"], ["aaa", "bbb", "ccc"]]});
		}.bind(this));
	});

	QUnit.test("ResponsiveTableType should have 'Inactive' row template when no rowPress event is attached", function(assert) {
		var done = assert.async();
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable"
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTemplate.getType(), "Inactive", "row template is Inactive since no rowPress event is attached");
			done();
		}.bind(this));
	});

	QUnit.test("ResponsiveTableType should have 'Active' row template type when rowPress event is attached", function(assert) {
		var done = assert.async();
		this.oTable.destroy();
		this.oTable = new Table({
			type: "ResponsiveTable",
			rowPress: function() {
				return true;
			}
		});

		this.oTable.addColumn(new Column({
			header: "Test",
			template: new Text({
				text: "Test"
			})
		}));

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTemplate.getType(), "Active", "row template type is Active since rowPress event is attached");
			done();
		}.bind(this));
	});

	QUnit.test("Destroy immediately after create - destroys toolbar", function(assert) {
		// Destroy the old/default table, as this is not used for this test
		this.oTable.destroy();

		//Create a table (say grid table) and destroy it immediately
		var oTable = new Table();

		oTable.getActions(); //Leads to immediate creation of toolbar
		var oToolbar = oTable._oToolbar;
		oTable.destroy();

		assert.ok(!oTable._oTable);
		assert.ok(!oTable._oTemplate);
		assert.ok(!oTable._oToolbar);
		// Toolbar is destroyed
		assert.strictEqual(oToolbar.bIsDestroyed, true);
	});

	QUnit.module("Filter info bar", {
		beforeEach: function() {
			this.oTable = new Table();
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
			MDCQUnitUtils.restorePropertyInfos(this.oTable);
		},
		getFilterInfoBar: function(oMDCTable) {
			var oTable = this.oTable || oMDCTable;
			var oFilterInfoBar;

			if (oTable._bMobileTable) {
				oFilterInfoBar = oTable._oTable.getInfoToolbar();
			} else {
				oFilterInfoBar = oTable._oTable.getExtension()[1];
			}

			if (oFilterInfoBar && oFilterInfoBar.isA("sap.m.OverflowToolbar")) {
				return oFilterInfoBar;
			} else {
				return null;
			}
		},
		getFilterInfoText: function(oMDCTable) {
			var oTable = this.oTable || oMDCTable;
			var oFilterInfoBar = this.getFilterInfoBar(oTable);
			return oFilterInfoBar ? oFilterInfoBar.getContent()[0] : null;
		},
		hasFilterInfoBar: function(oMDCTable) {
			var oTable = this.oTable || oMDCTable;
			return this.getFilterInfoBar(oTable) !== null;
		},
		waitForFilterInfoBarRendered: function(oMDCTable) {
			var oTable = this.oTable || oMDCTable;

			return new Promise(function(resolve) {
				var oFilterInfoBar = this.getFilterInfoBar(oTable);

				if (!oFilterInfoBar.getDomRef()) {
					oFilterInfoBar.addEventDelegate({
						onAfterRendering: function() {
							oFilterInfoBar.removeEventDelegate(this);
							resolve();
						}
					});
				} else {
					resolve();
				}
			}.bind(this));
		}
	});

	QUnit.test("Filter info bar (filter disabled)", function(assert) {
		var that = this;

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "name",
				label: "NameLabel"
			}
		]);

		return this.oTable.initialized().then(function() {
			assert.ok(!that.hasFilterInfoBar(), "No initial filter conditions: Filter info bar does not exist");
		}).then(function() {
			that.oTable.destroy();
			that.oTable = new Table({
				filterConditions: {
					name: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					]
				}
			});
			return that.oTable.initialized();
		}).then(function() {
			assert.ok(!that.hasFilterInfoBar(), "Initial filter conditions: Filter info bar does not exist");

			that.oTable.setFilterConditions({
				age: [
					{
						isEmpty: null,
						operator: "EQ",
						validated: "NotValidated",
						values: ["test"]
					}
				]
			});

			return wait(50);
		}).then(function() {
			assert.ok(!that.hasFilterInfoBar(), "Change filter conditions: Filter info bar does not exist");

			that.oTable.setP13nMode(["Filter"]);
			assert.ok(that.hasFilterInfoBar(), "Filtering enabled: Filter info bar exists");
			assert.ok(!that.getFilterInfoBar().getVisible(), "Filtering enabled: Filter info bar is invisible");
		});
	});

	aTestedTypes.forEach(function(sTableType) {
		QUnit.test("Filter info bar with table type = " + sTableType + "(filter enabled)", function(assert) {
			var that = this;
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var oListFormat = ListFormat.getInstance();

			this.oTable.destroy();
			this.oTable = new Table({
				type: sTableType,
				p13nMode: ["Filter"]
			});

			MDCQUnitUtils.stubPropertyInfos(this.oTable, [
				{
					name: "name",
					label: "NameLabel"
				}, {
					name: "age",
					label: "AgeLabel"
				}, {
					name: "gender",
					label: "GenderLabel"
				}
			]);

			return this.oTable.initialized().then(function() {
				assert.ok(that.hasFilterInfoBar(), "No initial filter conditions: Filter info bar exists");
				assert.ok(!that.getFilterInfoBar().getVisible(), "No initial filter conditions: Filter info bar is invisible");
			}).then(function() {
				that.oTable.destroy();
				that.oTable = new Table({
					columns: [
						new Column({
							template: new Text(),
							dataProperty: "name",
							header: "NameLabelColumnHeader"
						}),
						new Column({
							template: new Text(),
							dataProperty: "age",
							header: "AgeLabelColumnHeader"
						})
					],
					type: sTableType,
					p13nMode: ["Filter"],
					filterConditions: {
						name: [
							{
								isEmpty: null,
								operator: "EQ",
								validated: "NotValidated",
								values: ["test"]
							}
						]
					}
				});
				that.oTable.placeAt("qunit-fixture");
				Core.applyChanges();
				return Promise.all([that.oTable.initialized(), that.oTable.awaitPropertyHelper()]);
			}).then(function() {
				assert.ok(that.hasFilterInfoBar(), "Initial filter conditions: Filter info bar exists");
				assert.ok(that.getFilterInfoBar().getVisible(), "Initial filter conditions: Filter info bar is visible");
				assert.strictEqual(that.getFilterInfoText().getText(),
					oResourceBundle.getText("table.FILTER_INFO", oListFormat.format(["NameLabel"])),
					"Initial filter conditions: The filter info bar text is correct (1 filter)");
				assert.equal(that.oTable._oTable.getAriaLabelledBy().filter(function(sId) {
					return sId === that.getFilterInfoText().getId();
				}).length, 1, "The filter info bar text is in the \"ariaLabelledBy\" association of the table");

				that.oTable.setFilterConditions({
					name: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					],
					age: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					]
				});

				return that.oTable.awaitPropertyHelper();
			}).then(function() {
				return that.waitForFilterInfoBarRendered();
			}).then(function() {
				var oFilterInfoBar = that.getFilterInfoBar();

				assert.strictEqual(that.getFilterInfoText().getText(),
					oResourceBundle.getText("table.FILTER_INFO", oListFormat.format(["NameLabel", "AgeLabel"])),
					"Change filter conditions: The filter info bar text is correct (2 filters)");

				oFilterInfoBar.focus();
				assert.strictEqual(document.activeElement, oFilterInfoBar.getFocusDomRef(), "The filter info bar is focused");

				that.oTable.setFilterConditions({
					name: []
				});
				assert.ok(that.hasFilterInfoBar(), "Filter conditions removed: Filter info bar exists");
				assert.ok(!that.getFilterInfoBar().getVisible(), "Filter conditions removed: Filter info bar is invisible");
				assert.ok(that.oTable.getDomRef().contains(document.activeElement), "The table has the focus");

				that.oTable.setFilterConditions({
					name: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					],
					age: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					],
					gender: [
						{
							isEmpty: null,
							operator: "EQ",
							validated: "NotValidated",
							values: ["test"]
						}
					]
				});

				return that.oTable.awaitPropertyHelper();
			}).then(function() {
				assert.ok(that.getFilterInfoBar().getVisible(), "Set filter conditions: Filter info bar is visible");
				assert.strictEqual(that.getFilterInfoText().getText(),
					oResourceBundle.getText("table.FILTER_INFO", oListFormat.format(["NameLabel", "AgeLabel", "GenderLabel"])),
					"Set filter conditions: The filter info bar text is correct (3 filters)");
				assert.equal(that.oTable._oTable.getAriaLabelledBy().filter(function(sId) {
					return sId === that.getFilterInfoText().getId();
				}).length, 1, "The filter info bar text is in the \"ariaLabelledBy\" association of the table");
			}).then(function() {
				return that.waitForFilterInfoBarRendered();
			}).then(function() {
				var oFilterInfoBar = that.getFilterInfoBar();

				that.oTable.setP13nMode();

				oFilterInfoBar.focus();
				assert.strictEqual(document.activeElement, oFilterInfoBar.getFocusDomRef(), "The filter info bar is focused");

				that.oTable.setP13nMode(["Column", "Sort"]);
				assert.ok(that.hasFilterInfoBar(), "Filter disabled: Filter info bar exists");
				assert.ok(!oFilterInfoBar.getVisible(), "Filter disabled: Filter info bar is invisible");
				assert.ok(that.oTable.getDomRef().contains(document.activeElement), "The table has the focus");

				that.oTable.destroy();
				assert.ok(oFilterInfoBar.bIsDestroyed, "Filter info bar is destroyed when the table is destroyed");
			});
		});
	});

	QUnit.test("Filter info bar after changing table type", function(assert) {
		var that = this;

		this.oTable.destroy();
		this.oTable = new Table({
			p13nMode: ["Filter"]
		});

		return this.oTable.initialized().then(function() {
			that.oTable.setType("ResponsiveTable");
			return that.oTable.initialized();
		}).then(function() {
			assert.ok(that.hasFilterInfoBar(), "Changed from \"Table\" to \"ResponsiveTable\": Filter info bar exists");
			assert.equal(that.oTable._oTable.getAriaLabelledBy().filter(function(sId) {
				return sId === that.getFilterInfoText().getId();
			}).length, 1, "Changed from \"Table\" to \"ResponsiveTable\": The filter info bar text is in the \"ariaLabelledBy\" association of the"
						  + " table");
		}).then(function() {
			that.oTable.setType("Table");
			return that.oTable.initialized();
		}).then(function() {
			assert.ok(that.hasFilterInfoBar(), "Changed from \"ResponsiveTable\" to \"Table\": Filter info bar exists");
			assert.equal(that.oTable._oTable.getAriaLabelledBy().filter(function(sId) {
				return sId === that.getFilterInfoText().getId();
			}).length, 1, "Changed from \"ResponsiveTable\" to \"Table\": The filter info bar text is in the \"ariaLabelledBy\" association of the"
						  + " table");
		});
	});

	QUnit.test("Press the filter info bar", function(assert) {
		var that = this;

		this.oTable.addColumn(new Column({
			template: new Text(),
			dataProperty: "name"
		}));
		this.oTable.setP13nMode(["Filter"]);

		MDCQUnitUtils.stubPropertyInfos(this.oTable, [
			{
				name: "age",
				label: "AgeLabel"
			}
		]);

		return this.oTable.initialized().then(function() {
			that.oTable.setFilterConditions({
				age: [
					{
						isEmpty: null,
						operator: "EQ",
						validated: "NotValidated",
						values: ["test"]
					}
				]
			});

			return that.oTable.awaitPropertyHelper();
		}).then(function() {
			return that.waitForFilterInfoBarRendered();
		}).then(function() {
			var oTableSettingsShowPanelSpy = sinon.stub(TableSettings, "showPanel");
			var oFilterInfoBar = that.getFilterInfoBar();
			var iIntervalId;

			oFilterInfoBar.firePress();

			assert.equal(oTableSettingsShowPanelSpy.callCount, 1, "TableSettings.showPanel is called once");
			assert.ok(oTableSettingsShowPanelSpy.calledWithExactly(that.oTable, "Filter", oFilterInfoBar),
				"TableSettings.showPanel is called with the correct arguments");

			that.oTable.setFilterConditions({
				name: []
			});

			// # 1 - Simulate that the filter info bar is focused after being set to invisible, but before rendering.
			// The focus should still be somewhere in the table after the filter info bar is hidden.

			// # 2 - Simulate setting the focus when the filter dialog is closed and all filters have been removed.
			// The filter info bar will be hidden in this case. The focus should still be somewhere in the table and not on the document body.

			oFilterInfoBar.focus();

			return Promise.race([
				new Promise(function(resolve) { // wait until the FilterInfoBar is hidden
					iIntervalId = setInterval(function() {
						if (!oFilterInfoBar.getDomRef()) {
							resolve();
						}
					}, 10);
				}),
				wait(100) // timeout
			]).then(function() {
				clearInterval(iIntervalId);
			});
		}).then(function() {
			// # 1
			assert.ok(that.oTable.getDomRef().contains(document.activeElement), "The table has the focus");

			// # 2
			document.body.focus();
			that.getFilterInfoBar().focus();
			assert.ok(that.oTable.getDomRef().contains(document.activeElement), "The table has the focus");
		});
	});

	aTestedTypes.forEach(function(sTableType) {
		QUnit.module("Row actions - " + sTableType, {
			beforeEach: function() {
				this.oTable = new Table({
					type: sTableType
				});
				this.oTable.placeAt("qunit-fixture");
				Core.applyChanges();
				return this.oTable.initialized();
			},
			afterEach: function() {
				this.oTable.destroy();
			},
			assertInnerTableAction: function(assert, oMDCTable) {
				var oTable = oMDCTable || this.oTable;

				switch (sTableType) {
					case "ResponsiveTable":
						assert.equal(oTable._oTemplate.getType(), "Navigation", "Type of the list item template");
						break;
					default:
						assert.ok(oTable._oTable.getRowActionTemplate(), "Row action template exists");
						assert.equal(oTable._oTable.getRowActionTemplate().getItems().length, 1, "With one item");
						assert.equal(oTable._oTable.getRowActionTemplate().getItems()[0].getType(), "Navigation", "Of type 'Navigation'");
						assert.equal(oTable._oTable.getRowActionCount(), 1, "Row action count");
				}
			},
			assertNoInnerTableAction: function(assert, oMDCTable) {
				var oTable = oMDCTable || this.oTable;

				switch (sTableType) {
					case "ResponsiveTable":
						assert.equal(oTable._oTemplate.getType(), "Inactive", "Type of the list item template");
						break;
					default:
						assert.notOk(oTable._oTable.getRowActionTemplate(), "Row action template does not exist");
						assert.equal(oTable._oTable.getRowActionCount(), 0, "Row action count");
				}
			}
		});

		QUnit.test("Initialize without actions", function(assert) {
			this.assertNoInnerTableAction(assert);
		});

		QUnit.test("Initialize with actions", function(assert) {
			var oTable = new Table({
				type: sTableType,
				rowAction: ["Navigation"]
			});

			return oTable.initialized().then(function() {
				this.assertInnerTableAction(assert, oTable);
			}.bind(this));
		});

		QUnit.test("Add and remove actions", function(assert) {
			var oTableInvalidationSpy = sinon.spy(this.oTable, "invalidate");
			var oRowActionTemplateDestroySpy;

			this.oTable.setRowAction(["Navigation"]);
			assert.equal(oTableInvalidationSpy.callCount, 0, "MDCTable was not invalidated");
			this.assertInnerTableAction(assert);
			oTableInvalidationSpy.reset();

			if (sTableType === "GridTable") {
				oRowActionTemplateDestroySpy = sinon.spy(this.oTable._oTable.getRowActionTemplate(), "destroy");
			}

			this.oTable.setRowAction();
			assert.equal(oTableInvalidationSpy.callCount, 0, "MDCTable was not invalidated");
			this.assertNoInnerTableAction(assert);

			if (sTableType === "GridTable") {
				assert.equal(oRowActionTemplateDestroySpy.callCount, 1, "Row action template was destroyed");
			}
		});

		QUnit.test("Avoid unnecessary update", function(assert) {
			var oTableInvalidationSpy = sinon.spy(this.oTable, "invalidate");
			var oInnerTableInvalidationSpy = sinon.spy(this.oTable._oTable, "invalidate");

			this.oTable.setRowAction();
			assert.equal(oTableInvalidationSpy.callCount, 0, "Remove row actions if no actions exist: MDCTable was not invalidated");
			assert.equal(oInnerTableInvalidationSpy.callCount, 0, "Remove row actions if no actions exist: The inner table was not invalidated");
			oTableInvalidationSpy.reset();
			oInnerTableInvalidationSpy.reset();

			this.oTable.setProperty("rowAction", ["Navigation"], true);
			this.oTable.setRowAction(["Navigation"]);
			assert.equal(oTableInvalidationSpy.callCount, 0, "Set the same row action: MDCTable was not invalidated");
			assert.equal(oInnerTableInvalidationSpy.callCount, 0, "Set the same row action: The inner table was not invalidated");
			oTableInvalidationSpy.reset();
			oInnerTableInvalidationSpy.reset();
		});
	});

	QUnit.module("p13nMode", {
		beforeEach: function() {
			this.oTable = new Table();
			return this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		assertToolbarButtons: function(assert, oMDCTable, sTitle) {
			if (typeof oMDCTable === "string") {
				sTitle = oMDCTable;
				oMDCTable = undefined;
			}

			var oTable = oMDCTable || this.oTable;
			var aModes = oTable.getP13nMode();
			var sTitlePrefix = sTitle ? sTitle + ": " : "";

			if (aModes.length === 0) {
				assert.equal(oTable._oToolbar.getEnd().length, 0, sTitlePrefix + "No toolbar buttons");
				return;
			}

			function findButton(sIcon) {
				return oTable._oToolbar.getEnd().filter(function(oButton) {
					return oButton.getIcon && oButton.getIcon() === "sap-icon://" + sIcon;
				});
			}

			aModes.forEach(function(sMode) {
				switch (sMode) {
					case "Filter":
						assert.ok(findButton("filter"), sTitlePrefix + "Filter button exists");
						break;
					case "Sort":
						assert.ok(findButton("sort"), sTitlePrefix + "Sort button exists");
						break;
					default:
						assert.ok(findButton("action-settings"), sTitlePrefix + "Column settings button exists");
				}
			});
		},
		assertAPI: function(assert, oMDCTable) {
			var oTable = oMDCTable || this.oTable;
			var aModes = oTable.getP13nMode();

			assert.strictEqual(oTable.isSortingEnabled(), aModes.indexOf("Sort") > -1, "#isSortingEnabled");
			assert.strictEqual(oTable.isFilteringEnabled(), aModes.indexOf("Filter") > -1, "#isFilteringEnabled");
		},
		assertColumnDnD: function(assert, oMDCTable) {
			var oTable = oMDCTable || this.oTable;
			var bEnabled = oTable.getP13nMode().indexOf("Column") > -1;

			assert.equal(oTable._oTable.getDragDropConfig()[0].getEnabled(), bEnabled, "DragDropConfig for column reordering");
		}
	});

	QUnit.test("Initialize without active modes", function(assert) {
		this.assertToolbarButtons(assert);
		this.assertAPI(assert);
		this.assertColumnDnD(assert);
	});

	QUnit.test("Initialize with active modes", function(assert) {
		var oTable = new Table({
			p13nMode: ["Sort", "Column"]
		});

		return oTable.initialized().then(function() {
			this.assertToolbarButtons(assert, oTable);
			this.assertAPI(assert, oTable);
			this.assertColumnDnD(assert, oTable);
		}.bind(this));
	});

	QUnit.test("Activate and deactivate", function(assert) {
		this.oTable.setP13nMode(["Sort"]);
		this.assertToolbarButtons(assert, "Activate 'Sort'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Column"]);
		this.assertToolbarButtons(assert, "Activate 'Column'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Column", "Filter"]);
		this.assertToolbarButtons(assert, "Activate 'Filter'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode(["Sort", "Filter"]);
		this.assertToolbarButtons(assert, "Deactivate 'Column'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);

		this.oTable.setP13nMode();
		this.assertToolbarButtons(assert, "Deactivate 'Sort' and 'Filter'");
		this.assertAPI(assert);
		this.assertColumnDnD(assert);
	});

	QUnit.test("Avoid unnecessary update", function(assert) {
		var oTableInvalidationSpy = sinon.spy(this.oTable, "invalidate");
		var oInnerTableInvalidationSpy = sinon.spy(this.oTable._oTable, "invalidate");

		this.oTable.setP13nMode();
		assert.equal(oTableInvalidationSpy.callCount, 0, "Deactivate modes if no modes are active: MDCTable was not invalidated");
		assert.equal(oInnerTableInvalidationSpy.callCount, 0, "Deactivate modes if no modes are active: The inner table was not invalidated");

		this.oTable.setP13nMode(["Sort", "Column", "Filter"]);
		oTableInvalidationSpy.reset();
		oInnerTableInvalidationSpy.reset();

		var oToolbar = this.oTable._oToolbar;
		var aP13nButtons = oToolbar.getEnd();

		this.oTable.setP13nMode(["Column", "Sort", "Filter"]);
		assert.equal(oTableInvalidationSpy.callCount, 0, "Activate modes that are already active: MDCTable was not invalidated");
		assert.equal(oInnerTableInvalidationSpy.callCount, 0, "Activate modes that are already active: The inner table was not invalidated");

		assert.ok(aP13nButtons.every(function(oButton) {
			return oButton.bIsDestroyed !== true;
		}), "The p13n buttons were not destroyed");

		assert.ok(aP13nButtons.every(function(oButton) {
			return oToolbar.indexOfEnd(oButton) > -1;
		}), "The p13n buttons are still in the toolbar");
	});

	QUnit.test("Current state", function(assert) {
		var aSortConditions = [{
			name: "test",
			descending: true
		}];
		var oFilterConditions = {
			name: [{
				isEmpty: null,
				operator: "EQ",
				validated: "NotValidated",
				values: ["test"]
			}]
		};

		assert.deepEqual(this.oTable.getCurrentState(), {}, "No modes active");

		this.oTable.setP13nMode(["Column"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: []
		}, "Activate 'Column'");

		this.oTable.addColumn(new Column({
			dataProperty: "test"
		}));
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}]
		}, "Add a column");

		this.oTable.setP13nMode(["Column", "Sort"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}],
			sorters: []
		}, "Activate 'Sort'");

		this.oTable.setSortConditions({
			sorters: aSortConditions
		});
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}],
			sorters: aSortConditions
		}, "Set sort conditions");

		this.oTable.setP13nMode(["Column", "Sort", "Filter"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}],
			sorters: aSortConditions,
			filter:  {}
		}, "Activate 'Filter'");

		this.oTable.setFilterConditions(oFilterConditions);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{name: "test"}],
			sorters: aSortConditions,
			filter: oFilterConditions
		}, "Set filter conditions");

		this.oTable.setP13nMode(["Column", "Filter"]);
		assert.deepEqual(this.oTable.getCurrentState(), {
			items: [{
				name: "test"
			}],
			filter: oFilterConditions
		}, "Deactivate 'Sort'");

		this.oTable.setP13nMode();
		assert.deepEqual(this.oTable.getCurrentState(), {}, "Deactivate 'Column' and 'Filter'");
	});

	QUnit.module("showDetailsButton", {
		beforeEach: function() {
			var oModel = new JSONModel();
			oModel.setData({
				testPath: [
					{test: "Test1"}, {test: "Test2"}, {test: "Test3"}, {test: "Test4"}, {test: "Test5"}
				]
			});

			this.oTable = new Table({
				type: new ResponsiveTableType({
					showDetailsButton: true
				}),
				columns: [
					new Column({
						header: "Column A",
						hAlign: "Begin",
						importance: "High",
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						header: "Column B",
						hAlign: "Begin",
						importance: "High",
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						header: "Column C",
						hAlign: "Begin",
						importance: "Medium",
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						header: "Column D",
						hAlign: "Begin",
						importance: "Low",
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						header: "Column E",
						hAlign: "Begin",
						importance: "Low",
						template: new Text({
							text: "{test}"
						})
					}),
					new Column({
						header: "Column F",
						hAlign: "Begin",
						importance: "High",
						template: new Text({
							text: "{test}"
						})
					})
				]
			});

			this.oTable.setModel(oModel);
			this.oTable.placeAt("qunit-fixture");
			this.oType = this.oTable.getType();
			Core.applyChanges();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Button creation", function(assert) {
		var done = assert.async(),
			clock = sinon.useFakeTimers();

		assert.ok(this.oType.getShowDetailsButton(), "showDetailsButton = true");

		this.oTable.initialized().then(function() {
			this.oTable.bindRows({
				path: "/testPath"
			});
			assert.ok(this.oType._oShowDetailsButton, "button is created");
			assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden since there are no popins");
			assert.strictEqual(this.oType._oShowDetailsButton.getText(), "Show Details", "correct text is set on the button");

			this.oTable._oTable.setContextualWidth("Tablet");
			clock.tick(1);
			assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");
			assert.strictEqual(this.oType._oShowDetailsButton.getText(), "Show Details", "correct text is set on the button");

			this.oType._oShowDetailsButton.firePress();
			clock.tick(1);
			assert.strictEqual(this.oType._oShowDetailsButton.getText(), "Hide Details", "correct text is set on the button");

			this.oTable._oTable.setContextualWidth("4444px");
			clock.tick(1);
			assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");
			done();
		}.bind(this));
	});

	QUnit.test("Button placement", function(assert) {
		var done = assert.async(),
			clock = sinon.useFakeTimers();

		this.oTable.initialized().then(function() {
			this.oTable._oTable.setContextualWidth("Tablet");
			clock.tick(1);
			var bButtonAddedToToolbar = this.oTable._oTable.getHeaderToolbar().getEnd().some(function(oControl) {
				return oControl.getId() === this.oType._oShowDetailsButton.getId();
			}, this);
			assert.ok(bButtonAddedToToolbar, "Button is correctly added to the table header toolbar");

			this.oType.setShowDetailsButton(false);
			clock.tick(1);
			assert.notOk(this.oType.getShowDetailsButton(), "showDetailsButton = false");
			bButtonAddedToToolbar = this.oTable._oTable.getHeaderToolbar().getEnd().some(function(oControl) {
				return oControl.getId() === this.oType._oShowDetailsButton.getId();
			}, this);
			assert.notOk(bButtonAddedToToolbar, "Button is removed from the table header toolbar");
			done();
		}.bind(this));
	});

	QUnit.test("Inner table hiddenInPopin property in Desktop mode", function(assert) {
		var done = assert.async();

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin().length, 1, "getHiddenInPopin() contains only 1 value");
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin()[0], "Low", "Low importance is added to the hiddenInPopin property");
			done();
		}.bind(this));
	});

	QUnit.test("Inner table hiddenInPopin property in Phone mode", function(assert) {
		var done = assert.async();
		// save original state
		var bDesktop = Device.system.desktop;
		var bTablet = Device.system.tablet;
		var bPhone = Device.system.phone;

		// overwrite for our test case
		Device.system.desktop = false;
		Device.system.tablet = false;
		Device.system.phone = true;
		Core.applyChanges();

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin().length, 2, "getHiddenInPopin() contains only 1 value");
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin()[0], "Low", "Low importance is added to the hiddenInPopin property");
			assert.strictEqual(this.oTable._oTable.getHiddenInPopin()[1], "Medium", "Medium importance is added to the hiddenInPopin property");

			// reset original state
			Device.system.desktop = bDesktop;
			Device.system.tablet = bTablet;
			Device.system.phone = bPhone;
			done();
		}.bind(this));
	});

	QUnit.test("Button should be hidden with filtering leads to no data and viceversa", function(assert) {
		var done = assert.async(),
			clock = sinon.useFakeTimers();

		this.oTable.initialized().then(function() {
			this.oTable.bindRows({
				path: "/testPath"
			});

			this.oTable._oTable.setContextualWidth("Tablet");
			clock.tick(1);
			assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has popins");

			this.oTable._oTable.getBinding("items").filter(new Filter("test", "EQ", "foo"));
			clock.tick(1);
			assert.notOk(this.oType._oShowDetailsButton.getVisible(), "button is hidden since there are no visible items");

			this.oTable._oTable.getBinding("items").filter();
			clock.tick(1);
			assert.ok(this.oType._oShowDetailsButton.getVisible(), "button is visible since table has visible items and popins");

			done();
		}.bind(this));
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.oTable = new Table();
		},
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("Accessibility test for Responsive inner table", function (assert) {
		var done = assert.async();
		this.oTable.setType("ResponsiveTable");
		assert.strictEqual(this.oTable.getType(), "ResponsiveTable", "Responsive table type");
		this.oTable.addColumn(
			new Column({
				header: "Test0",
				template: new VBox({
					items: new Link({
						text: "template1"
					})
				})
			})
		);

		this.oTable.addColumn(
			new Column({
				header: "Test1",
				template: new Text({
					text: "template0"
				})
			})
		);

		var sId = this.oTable.getColumns()[1].getId();
		this.oTable.removeColumn(this.oTable.getColumns()[1]);

		this.oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		this.oTable.initialized().then(function() {
			assert.notOk(Core.getStaticAreaRef().querySelector("#" + sId), "Static Area removed after initialized to column before initialized");
			assert.strictEqual(Core.getStaticAreaRef().querySelector("#" + this.oTable.getColumns()[0].getId()).innerHTML, "Test0", "Static Area added to the first Column Before initialization");
			sId = this.oTable.getColumns()[0].getId();
			this.oTable.removeColumn(this.oTable.getColumns()[0]);
			assert.notOk(Core.getStaticAreaRef().querySelector("#" + sId), "Static Area removed after initialization to column before initialized");

			this.oTable.addColumn(
				new Column({
					header: "Test2",
					template: new Text({
						text: "template0"
					})
				})
			);
			// place the table at the dom
			Core.applyChanges();
			assert.strictEqual(Core.getStaticAreaRef().querySelector("#" + this.oTable.getColumns()[0].getId()).innerHTML, "Test2", "Static Area added to the second Column after the table is initialised");
			sId = this.oTable.getColumns()[0].getId();
			this.oTable.getColumns()[0].destroy();
			assert.notOk(Core.getStaticAreaRef().querySelector("#" + sId), "Static Area removed after initialization to column after initialized");
			done();
		}.bind(this));
	});

	QUnit.test("Header Level Property added", function(assert) {
		var done = assert.async();
		this.oTable.setType("ResponsiveTable");
		assert.strictEqual(this.oTable.getHeaderLevel(), "Auto", "Header level set to the header");
		this.oTable.setHeaderLevel("H2");
		this.oTable.setHeader("Test Table");

		this.oTable.initialized().then(function() {
			assert.strictEqual(this.oTable._oTable.getHeaderToolbar().getContent()[0].getLevel(), "H2", "Header level changed");
			done();
		}.bind(this));
	});
});
