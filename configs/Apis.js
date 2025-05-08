import axios from "axios"

const BASE_URL = 'https://copcopne.pythonanywhere.com/'
export const endpoints = {
    // Users
    login: '/o/token',
    register: '/users/register/',

    users: '/users/',
    getUser: (user_id) => `/users/${user_id}/`,
    getUserFollowers: (user_id) => `/users/${user_id}/followers/`,
    getUserFollowings: (user_id) => `/users/${user_id}/following/`,
    currentUser: '/users/current_user/',
    currentUserFollowers: '/users/current_user/followers/',
    currentUserFollowings: '/users/current_user/following/',

    blockUser: (user_id) => `/users/${user_id}/block_user/`,
    unblockUser: (user_id) => `/users/${user_id}/unblock_user/`,

    followUser: (user_id) => `/users/${user_id}/follow/`,

    resetPasswordDeadline: (user_id, hours) => `/users/${user_id}reset_password_deadline/${hours}`,

    getUnverifiedUsers: '/users/unverified_users/',
    verify: (user_id) => `/users/${user_id}/verify/`,

    // Posts
    posts: '/posts/',

    getPost: (post_id) => `/posts/${post_id}/`,
    deletePost: (post_id) => `/posts/${post_id}/delete_post/`,
    updatePost: (post_id) => `/posts/${post_id}/update_post/`,
    updatePostMediaUpload: (post_id) => `/posts/${post_id}/update_post/upload_media/`,
    updatePostDeleteMedia: (post_id, media_id) => `/posts/${post_id}/update_post/media/${media_id}/`,

    comment: (post_id) => `/posts/${post_id}/comment/`,
    getComments: (post_id) => `/posts/${post_id}/comments/`,

    vote: (post_id) => `/posts/${post_id}/vote/`,

    interactPost: (post_id, reaction) => `/posts/${post_id}/interact/${reaction}/`,
    PostInteractions: (post_id) => `/posts/${post_id}/interactions/`,
    
    share: (post_id) => `/posts/${post_id}/share/`,

    // Comments
    deleteComment: (comment_id) => `/comment/${comment_id}/delete_comment/`,
    interactComment: (comment_id, reaction) => `/comment/${comment_id}/interact/${reaction}/`,
    CommentInteractions: (comment_id) => `/comment/${comment_id}/interactions/`,
    replyComment: (comment_id) => `/comment/${comment_id}/reply/`,
    updateComment: (comment_id)=> `/comment/${comment_id}/update_comment/`,








}

export default axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})