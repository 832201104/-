<template>
  <div>
    <el-card class="box-card" header="我的收藏">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="生日范围">
          <el-date-picker v-model="searchForm.birthdayRange" type="daterange" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchFavorites">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 联系人列表 -->
      <el-table :data="favorites" style="width: 100%">
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="backup_phone" label="备用手机号" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="social_media" label="社交媒体" />
        <el-table-column prop="birthday" label="生日">
          <template #default="scope">
            <span>{{ new Date(scope.row.birthday).toLocaleDateString().replace(/\//g, '-') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" type="warning" @click="unfavorite(scope.row)">
              取消收藏
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 修改分页组件 -->
      <el-pagination style="margin-top: 20px" background layout="total, prev, pager, next" :total="total"
        :current-page="currentPage" :page-size="pageSize" @current-change="handlePageChange" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { contactsFavorites, contactsUnfavorite } from '@/api/contacts/index';

const favorites = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

const searchForm = reactive({
  name: '',
  phone: '',
  birthdayRange: []
});

// 获取收藏列表
const fetchFavorites = async () => {
  try {
    const res = await contactsFavorites({
      ...searchForm,
      page: currentPage.value,
      limit: pageSize.value,
      startDate: searchForm.birthdayRange?.[0],
      endDate: searchForm.birthdayRange?.[1]
    });
    favorites.value = res.data;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('获取收藏列表失败');
  }
};

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    birthdayRange: []
  });
  currentPage.value = 1;
  fetchFavorites();
};

// 处理分页变化
const handlePageChange = (page) => {
  currentPage.value = page;
  fetchFavorites();
};

// 取消收藏
const unfavorite = async (contact) => {
  try {
    await contactsUnfavorite(contact.id);
    ElMessage.success('取消收藏成功');
    // 如果当前页只有一条数据，且不是第一页，则跳转到上一页
    if (favorites.value.length === 1 && currentPage.value > 1) {
      currentPage.value--;
    }
    fetchFavorites();
  } catch (error) {
    ElMessage.error('取消收藏失败');
  }
};

// 初始加载
fetchFavorites();
</script>

<style scoped>
.box-card {
  height: 100%;
}

.search-form {
  margin-bottom: 20px;
}
</style>