import { DataTypes, Model } from 'sequelize';

class Customer extends Model {
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.salt;
    return values;
  }
}

Customer.init({
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true // custom behavior in hooks
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      is: /^\d{10}$/i
    }
  },
  profileImage: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  verifiedEmail: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verifiedMobile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'blocked'),
    defaultValue: 'active'
  },
  token: {
    type: DataTypes.JSON, // Sequelize doesn't have native array-of-string
    defaultValue: []
  }
}, {
  sequelize,
  modelName: 'Customer',
  tableName: 'customers',
  timestamps: true,      // createdAt, updatedAt
  underscored: true      // uses snake_case in DB
});

Customer.beforeValidate((user) => {
  if (user.firstName) user.firstName = user.firstName.trim();
  if (user.lastName) user.lastName = user.lastName.trim();
  if (user.email) user.email = user.email.trim().toLowerCase();
  if (user.phone) user.phone = user.phone.trim();
});

export default Customer;
