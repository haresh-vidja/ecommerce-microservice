import { DataTypes, Model } from 'sequelize';

/**
 * Represents the User model with Sequelize ORM.
 * Fields: id, name, phone, password
 */
class User extends Model {
  /**
   * Initialize the User model
   * @param {Sequelize} sequelize - Sequelize instance
   * @returns {typeof User}
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
        tableName: 'users',        // Explicit table name (no pluralization)
        timestamps: true,          // Automatically add createdAt and updatedAt
        paranoid: false,           // Set to true if soft deletes (deletedAt) are needed
        underscored: false,        // Set to true if snake_case is preferred in DB
        freezeTableName: true,     // Prevents pluralization (e.g., `User` stays `users`)
        modelName: 'User'          // Optional but useful in associations/logs
      }
    );
  }

  /**
   * Define model associations (called in index.js after all models are initialized)
   * @param {object} models - All other models
   */
  static associate(models) {
    // Example:
    // this.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
  }
}

export default User;
