import axios from "axios"

const BASE_URL = 'https://copcopne.pythonanywhere.com'
export const endpoints = {
    // Users
    login: '/o/token/',
    register: '/users/register/',

    users: '/users/',
    getUser: (user_id) => `/users/${user_id}/`,
    getUserFollowers: (user_id) => `/users/${user_id}/followers/`,
    getUserFollowings: (user_id) => `/users/${user_id}/following/`,
    currentUser: '/users/current-user/',

    blockUser: (user_id) => `/users/${user_id}/block-user/`,
    unblockUser: (user_id) => `/users/${user_id}/unblock-user/`,

    followUser: (user_id) => `/users/${user_id}/follow/`,

    getLockedUsers: 'users/locked-users/',
    resetPasswordDeadline: (user_id) => `/users/${user_id}reset-password-deadline/`,

    getUnverifiedUsers: '/users/unverified-users/',
    verify: (user_id) => `/users/${user_id}/verify/`,

    // Posts
    posts: '/posts/',

    post: (post_id) => `/posts/${post_id}/`,
    updatePost: (post_id) => `/posts/${post_id}/update-post/`,
    updatePostMediaUpload: (post_id) => `/posts/${post_id}/update-post/upload-media/`,
    updatePostDeleteMedia: (post_id, media_id) => `/posts/${post_id}/update-post/media/${media_id}/`,

    commentOnPost: (post_id) => `/posts/${post_id}/comment/`,
    getComments: (post_id) => `/posts/${post_id}/comments/`,

    vote: (post_id) => `/posts/${post_id}/vote/`,

    interactPost: (post_id, reaction) => `/posts/${post_id}/interact/${reaction}/`,
    PostInteractions: (post_id) => `/posts/${post_id}/interactions/`,
    
    share: (post_id) => `/posts/${post_id}/share/`,

    // Comments
    comment: (comment_id) => `/comments/${comment_id}/`,
    interactComment: (comment_id, reaction) => `/comments/${comment_id}/interact/${reaction}/`,
    CommentInteractions: (comment_id) => `/comments/${comment_id}/interactions/`,
    replyComment: (comment_id) => `/comments/${comment_id}/reply/`,
    updateComment: (comment_id)=> `/comments/${comment_id}/update-comment/`,








}

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL, 
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: BASE_URL,
});