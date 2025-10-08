# F8-API Models Documentation

## Tổng quan

Dự án F8-API đã được cấu hình với đầy đủ các Sequelize models dựa trên các migration đã có. Tất cả các model đều được thiết lập với các mối quan hệ phù hợp và logic tự động tạo slug/username.

## Các Model đã tạo

### 1. Core Models

#### User Model (`src/db/models/User.js`)
- **Tự động tạo**: `full_name` từ `frist_name` + `last_name`
- **Tự động tạo**: `username` từ email hoặc tên (unique)
- **Mối quan hệ**:
  - 1:1 với UserSetting
  - 1:n với Posts, Comments, Notes, Questions, Likes, Bookmarks
  - n:n với Users (Follows - following/followers)
  - 1:n với UserCourses, UserLessons, UserActivities

#### Course Model (`src/db/models/Course.js`)
- **Tự động tạo**: `slug` từ `title` (unique)
- **Mối quan hệ**:
  - 1:n với Tracks
  - 1:n với UserCourses, Questions
  - n:n với LearningPaths

#### Track Model (`src/db/models/Track.js`)
- **Tự động tạo**: `slug` từ `title`
- **Mối quan hệ**:
  - n:1 với Course
  - 1:n với Lessons

#### Lesson Model (`src/db/models/Lesson.js`)
- **Tự động tạo**: `slug` từ `title`
- **Mối quan hệ**:
  - n:1 với Track
  - 1:n với UserLessons, Notes, Questions

#### Post Model (`src/db/models/Post.js`)
- **Tự động tạo**: `slug` từ `title` (unique)
- **Mối quan hệ**:
  - n:1 với User
  - n:n với Topics, Tags
  - 1:n với Comments, Likes, Bookmarks

#### Topic Model (`src/db/models/Topic.js`)
- **Tự động tạo**: `slug` từ `name` (unique)
- **Mối quan hệ**:
  - n:n với Posts

#### Tag Model (`src/db/models/Tag.js`)
- **Mối quan hệ**:
  - n:n với Posts

#### Video Model (`src/db/models/Video.js`)
- **Mối quan hệ**:
  - 1:n với Comments, Likes

#### LearningPath Model (`src/db/models/LearningPath.js`)
- **Tự động tạo**: `slug` từ `title` (unique)
- **Mối quan hệ**:
  - n:n với Courses

### 2. Junction Tables (Không có model riêng, chỉ có associations)

- **PostTopic**: Posts ↔ Topics (n:n)
- **PostTag**: Posts ↔ Tags (n:n)
- **LearningPathCourse**: LearningPaths ↔ Courses (n:n)
- **Follows**: Users ↔ Users (n:n)

### 3. Supporting Models

#### UserSetting Model (`src/db/models/UserSetting.js`)
- **Mối quan hệ**: 1:1 với User

#### UserCourse Model (`src/db/models/UserCourse.js`)
- **Mối quan hệ**: n:1 với User, Course

#### UserLesson Model (`src/db/models/UserLesson.js`)
- **Mối quan hệ**: n:1 với User, Lesson

#### UserActivity Model (`src/db/models/UserActivity.js`)
- **Mối quan hệ**: 1:1 với User

#### Like Model (`src/db/models/Like.js`)
- **Mối quan hệ**: n:1 với User
- **Polymorphic**: có thể like Posts, Videos, Comments

#### Bookmark Model (`src/db/models/Bookmark.js`)
- **Mối quan hệ**: n:1 với User, Post

#### Comment Model (`src/db/models/Comment.js`)
- **Mối quan hệ**: n:1 với User
- **Self-referential**: có thể reply comments
- **Polymorphic**: có thể comment Posts, Videos

#### Notification Model (`src/db/models/Notification.js`)
- **Polymorphic**: có thể notify Users

#### Note Model (`src/db/models/Note.js`)
- **Mối quan hệ**: n:1 với User, Lesson

#### Question Model (`src/db/models/Question.js`)
- **Mối quan hệ**: n:1 với User, Lesson, Course

#### NewFeed Model (`src/db/models/NewFeed.js`)
- **Standalone model**

## Utility Functions

### Slug Generator (`src/utils/slugGenerator.js`)

#### `generateUniqueSlug(text, Model, field, id)`
- Tạo slug unique từ text
- Kiểm tra uniqueness trong database
- Hỗ trợ update (exclude id hiện tại)

#### `generateUniqueUsername(email, Model, id, firstName, lastName)`
- Tạo username unique từ email hoặc tên
- Kiểm tra uniqueness trong database
- Hỗ trợ update (exclude id hiện tại)

## Cách sử dụng

### 1. Import models
```javascript
const db = require('./src/db/models');

// Sử dụng model
const user = await db.User.create({
    frist_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com'
});
// full_name và username sẽ được tự động tạo
```

### 2. Sử dụng relationships
```javascript
// Lấy user với posts
const userWithPosts = await db.User.findByPk(1, {
    include: ['posts']
});

// Lấy course với tracks và lessons
const courseWithTracks = await db.Course.findByPk(1, {
    include: [{
        model: db.Track,
        include: [db.Lesson]
    }]
});
```

### 3. Tạo slug tự động
```javascript
// Slug sẽ được tự động tạo khi tạo mới
const post = await db.Post.create({
    title: 'How to Learn JavaScript',
    content: 'This is a guide...'
});
// post.slug = 'how-to-learn-javascript'
```

## Lưu ý quan trọng

1. **Timestamps**: Tất cả models sử dụng `created_at` và `updated_at` thay vì `createdAt` và `updatedAt`
2. **Unique constraints**: Username và slug được đảm bảo unique
3. **Auto-generation**: Slug và username được tạo tự động khi tạo mới hoặc update
4. **Relationships**: Tất cả relationships đã được thiết lập đầy đủ
5. **Hooks**: Sử dụng Sequelize hooks để tự động tạo slug/username

## Testing

Models đã được test và hoạt động đúng với:
- ✅ Auto-generation của slug và username
- ✅ Database relationships
- ✅ Unique constraints
- ✅ Timestamp handling
