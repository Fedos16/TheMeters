const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @Organizations
 * name: String,
 * near: Number,
 * score: Number,
 * medium_claster_score: Number,
 * estimate: String
 */

const schema = new Schema(
	{
		date_create: Date,
		source: String,
		id3: String,
		id4: String,
		lat: Number,
		lng: Number,
		address: String,
		street: String,
		house_no: String,
		region: String,
		subway1: String,
		min_til_subway1: String,
		method_subway1: String,
		floors_total: Number,
		house_ready: String,
		release_year: Number,
		house_quantity_flats: Number,
		house_entrances: Number,
		text_score_houselevel: String,
		inhabitants_num: Number,
		objects_near: String,
		infrastructure_score: Number,
		infrastructure_level: String,
		zone: String,
		region: String,
		district: String,
		cluster_number: String,
		metro_nearby: String,
		shopping_center_near: String,
		shopping_center_logs: String,
		organizations: {
			type: Array
		}
	},
  	{
    	timestamps: true
  	}
);

schema.set('toJSON', {
  	virtuals: true
});

schema.index({"address": "text"}, {default_language: "russian"});

module.exports = mongoose.model('DataBase', schema);