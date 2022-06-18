import { DataTypes, Model } from 'sequelize';

class Address extends Model {}

Address.init({
  customerId: {
    type: DataTypes.INTEGER,  // Assuming Customer ID is integer (auto-increment primary key)
    allowNull: false,
    references: {
      model: 'customers',     // Refers to the table name
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address2: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  landmark: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pinCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  type: {
    type: DataTypes.ENUM('home', 'business'),
    defaultValue: 'home'
  }
}, {
  sequelize,
  modelName: 'Address',
  tableName: 'addresses',
  timestamps: true,
  underscored: true
});

export default Address;
