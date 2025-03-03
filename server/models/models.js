const sequelize = require('../db');
const { DataTypes } = require('sequelize');

/** Модель клиента */
const Client = sequelize.define('Client', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    photo: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

/** Модель мастера (тату-мастер) */
const Master = sequelize.define('Master', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    biography: { type: DataTypes.TEXT, allowNull: true },
    experience: { type: DataTypes.INTEGER, allowNull: true },
    photo: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

/** Модель администратора */
const Admin = sequelize.define('Admin', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });

/** Модель эскиза */
const Sketch = sequelize.define('Sketch', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: false },
    tags: { type: DataTypes.STRING, allowNull: true }, // например, "tribal, blackwork"
    isReserved: { type: DataTypes.BOOLEAN, defaultValue: false },
    masterId: { type: DataTypes.INTEGER, allowNull: true }, // если эскиз принадлежит конкретному мастеру
}, { timestamps: true });

/** Модель фотографии портфолио */
const PortfolioPhoto = sequelize.define('PortfolioPhoto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: false },
    tags: { type: DataTypes.STRING, allowNull: true },
    masterId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

/** Модель бронирования (для резервации эскиза и записи на приём) */
const Booking = sequelize.define('Booking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bookingType: {
        type: DataTypes.ENUM('sketch', 'appointment'),
        allowNull: false
    },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    masterId: { type: DataTypes.INTEGER, allowNull: true },  // обязательное при типе "appointment"
    sketchId: { type: DataTypes.INTEGER, allowNull: true },  // обязательное при типе "sketch"
    bookingTime: { type: DataTypes.DATE, allowNull: true },    // дата/время приёма (для appointment)
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
}, { timestamps: true });

/** Модель записи блога */
const BlogPost = sequelize.define('BlogPost', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    published: { type: DataTypes.BOOLEAN, defaultValue: false },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    adminId: { type: DataTypes.INTEGER, allowNull: false }, // автор записи — админ
    likes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // счетчик лайков
}, { timestamps: true });

const BlogPostLike = sequelize.define('BlogPostLike', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    blogPostId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

/** Модель отзыва */
const Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true },
    clientId: { type: DataTypes.INTEGER, allowNull: false },
    masterId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

/** Модель уведомления */
const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    recipientType: {
        type: DataTypes.ENUM('client', 'master'),
        allowNull: false
    },
    recipientId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: true }, // например, "booking", "reminder", "promotion"
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

/** Ассоциации */

// Клиент может иметь много бронирований и отзывов
Client.hasMany(Booking, { foreignKey: 'clientId' });
Booking.belongsTo(Client, { foreignKey: 'clientId' });
Client.hasMany(Review, { foreignKey: 'clientId' });
Review.belongsTo(Client, { foreignKey: 'clientId' });

// Мастер имеет портфолио, эскизы, получает записи на приём и отзывы
Master.hasMany(PortfolioPhoto, { foreignKey: 'masterId' });
PortfolioPhoto.belongsTo(Master, { foreignKey: 'masterId' });

Master.hasMany(Sketch, { foreignKey: 'masterId' });
Sketch.belongsTo(Master, { foreignKey: 'masterId' });

Master.hasMany(Booking, { foreignKey: 'masterId' });
Booking.belongsTo(Master, { foreignKey: 'masterId' });

Master.hasMany(Review, { foreignKey: 'masterId' });
Review.belongsTo(Master, { foreignKey: 'masterId' });

// Эскиз может быть зарезервирован (связь через Booking, тип "sketch")
Sketch.hasOne(Booking, { foreignKey: 'sketchId' });
Booking.belongsTo(Sketch, { foreignKey: 'sketchId' });

// Админ создаёт записи блога
Admin.hasMany(BlogPost, { foreignKey: 'adminId' });
BlogPost.belongsTo(Admin, { foreignKey: 'adminId' });

// (Необязательно) Если нужно задавать ассоциации для уведомлений, можно использовать scope 
// для фильтрации по типу получателя. Пример для клиентов:
Client.hasMany(Notification, {
    foreignKey: 'recipientId',
    constraints: false,
    scope: { recipientType: 'client' }
});
Notification.belongsTo(Client, {
    foreignKey: 'recipientId',
    constraints: false
});

// Аналогично можно задать ассоциации для мастеров:
Master.hasMany(Notification, {
    foreignKey: 'recipientId',
    constraints: false,
    scope: { recipientType: 'master' }
});
Notification.belongsTo(Master, {
    foreignKey: 'recipientId',
    constraints: false
});

BlogPost.hasMany(BlogPostLike, { foreignKey: 'blogPostId' });
BlogPostLike.belongsTo(BlogPost, { foreignKey: 'blogPostId' });

module.exports = {
    Client,
    Master,
    Admin,
    Sketch,
    PortfolioPhoto,
    Booking,
    BlogPost,
    Review,
    Notification,
    BlogPostLike,
    sequelize,
};