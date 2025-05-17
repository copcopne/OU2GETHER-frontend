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

    resetPasswordDeadline: (user_id) => `/users/${user_id}reset-password-deadline/`,

    getUnverifiedUsers: '/users/unverified-users/',
    verify: (user_id) => `/users/${user_id}/verify/`,

    // Posts
    posts: '/posts/',

    getPost: (post_id) => `/posts/${post_id}/`,
    deletePost: (post_id) => `/posts/${post_id}/delete-post/`,
    updatePost: (post_id) => `/posts/${post_id}/update-post/`,
    updatePostMediaUpload: (post_id) => `/posts/${post_id}/update-post/upload-media/`,
    updatePostDeleteMedia: (post_id, media_id) => `/posts/${post_id}/update-post/media/${media_id}/`,

    comment: (post_id) => `/posts/${post_id}/comment/`,
    getComments: (post_id) => `/posts/${post_id}/comments/`,

    vote: (post_id) => `/posts/${post_id}/vote/`,

    interactPost: (post_id, reaction) => `/posts/${post_id}/interact/${reaction}/`,
    PostInteractions: (post_id) => `/posts/${post_id}/interactions/`,
    
    share: (post_id) => `/posts/${post_id}/share/`,

    // Comments
    deleteComment: (comment_id) => `/comment/${comment_id}/delete-comment/`,
    interactComment: (comment_id, reaction) => `/comment/${comment_id}/interact/${reaction}/`,
    CommentInteractions: (comment_id) => `/comment/${comment_id}/interactions/`,
    replyComment: (comment_id) => `/comment/${comment_id}/reply/`,
    updateComment: (comment_id)=> `/comment/${comment_id}/update-comment/`,








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