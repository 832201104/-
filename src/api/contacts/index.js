import request from '@/utils/request';

// 查询所有联系人或根据条件分页查询
export const contactsPage = params => {
  return request({
    url: '/contacts/page',
    method: 'get',
    params
  });
};

// 根据 ID 查询联系人
export const contactsGetById = id => {
  return request({
    url: `/contacts/${id}`,
    method: 'get'
  });
};

// 添加联系人
export const contactsAdd = data => {
  return request({
    url: '/contacts/add',
    method: 'post',
    data
  });
};

// 更新联系人
export const contactsUpdate = data => {
  return request({
    url: '/contacts/update',
    method: 'put',
    data
  });
};

// 删除联系人
export const contactsDelete = id => {
  return request({
    url: `/contacts/delete/${id}`,
    method: 'delete'
  });
};

// 添加收藏接口
export function contactsFavorite(id) {
  return request({
    url: `/contacts/favorite/${id}`,
    method: 'put'
  })
}

// 取消收藏接口
export function contactsUnfavorite(id) {
  return request({
    url: `/contacts/unfavorite/${id}`,
    method: 'put'
  })
}

// 获取收藏列表接口
export function contactsFavorites(params) {
  return request({
    url: '/contacts/favorites',
    method: 'get',
    params
  })
}

export function contactsExport() {
  return request({
    url: '/contacts/export',
    method: 'get',
    responseType: 'blob'
  })
}

export function contactsTemplate() {
  return request({
    url: '/contacts/template',
    method: 'get',
    responseType: 'blob'
  })
}

export function contactsImport(data) {
  return request({
    url: '/contacts/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}