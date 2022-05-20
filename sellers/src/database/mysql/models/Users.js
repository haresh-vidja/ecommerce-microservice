import { DataTypes, Model } from 'sequelize';

class User extends Model {
  /**
   * Initializes the User model
   * @param {Sequelize} sequelize - Sequelize instance
   */
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'User',        // Optional: model name
        tableName: 'users',       // Maps to "users" table
        timestamps: true,         // Adds createdAt and updatedAt
        // paranoid: true,        // Enables soft deletes (adds deletedAt)
        // underscored: true,     // Uses snake_case instead of camelCase
        // freezeTableName: true, // Disables auto-pluralization of table name
      }
    );
  }

  /**
   * Define associations here (if any)
   * @param {Object} models - All defined models
   */
  static associate(models) {
    // Example:
    // this.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
  }
}

export default User;
