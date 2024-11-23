<template>
  <div>
    <el-card class="box-card" :header="isFavorites ? '收藏联系人' : '通讯录管理'">
      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form" v-if="!isFavorites">
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
          <el-button type="primary" @click="fetchContacts">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="table-operations">
        <template v-if="!isFavorites">
          <el-button type="primary" @click="openAddDialog">添加</el-button>
          <el-button type="success" :disabled="selectedContacts.length !== 1"
            @click="openEditDialog(selectedContacts[0])">编辑</el-button>
          <el-button type="danger" :disabled="selectedContacts.length === 0" @click="batchDelete">删除</el-button>
          <el-divider direction="vertical" />
          <el-button type="warning" @click="downloadTemplate">下载模板</el-button>
          <el-upload class="upload-demo" action="" :http-request="handleImport" :show-file-list="false"
            accept=".xlsx,.xls">
            <el-button type="primary">导入</el-button>
          </el-upload>
          <el-button type="success" @click="handleExport">导出</el-button>
        </template>
      </div>

      <!-- 联系人列表 -->
      <el-table :data="contacts" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="backup_phone" label="备用手机号" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="social_media" label="QQ" />
        <el-table-column prop="birthday" label="生日">
          <template #default="scope">
            <span>{{ new Date(scope.row.birthday).toLocaleDateString().replace(/\//g, '-') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template #default="scope">
            <el-button size="small" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteContact(scope.row.id)">删除</el-button>
            <el-button size="small" :type="scope.row.is_favorite ? 'warning' : 'success'"
              @click="toggleFavorite(scope.row)">
              {{ scope.row.is_favorite ? '取消收藏' : '收藏' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-if="!isFavorites" style="margin-top: 20px" background layout="total, prev, pager, next"
        :total="total" :current-page="pagination.page" :page-size="pagination.limit"
        @current-change="handlePageChange" />

      <!-- 添加/编辑联系人对话框 -->
      <el-dialog :title="isEditing ? '编辑联系人' : '添加联系人'" v-model="dialogVisible">
        <el-form :model="form" ref="formRef" label-width="80px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" />
          </el-form-item>
          <el-form-item label="备用手机号" prop="backup_phone">
            <el-input v-model="form.backup_phone" />
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input v-model="form.address" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="form.email" />
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker v-model="form.birthday" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="QQ" prop="social_media">
            <el-input v-model="form.social_media" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="isEditing ? updateContact() : addContact()">
              {{ isEditing ? '保存' : '添加' }}
            </el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Star } from '@element-plus/icons-vue'
import {
  contactsPage,
  contactsGetById,
  contactsAdd,
  contactsUpdate,
  contactsDelete,
  contactsFavorite,
  contactsUnfavorite,
  contactsFavorites,
  contactsExport,
  contactsTemplate,
  contactsImport
} from '@/api/contacts/index';

const route = useRoute();
const contacts = ref([]);
const total = ref(0);
const pagination = reactive({
  page: 1,
  limit: 10
});
const searchForm = reactive({
  name: '',
  phone: '',
  birthdayRange: []
});
const selectedContacts = ref([]);
const dialogVisible = ref(false);
const isEditing = ref(false);
const form = reactive({
  id: null,
  name: '',
  phone: '',
  backup_phone: '',
  address: '',
  email: '',
  birthday: '',
  social_media: ''
});
const formRef = ref(null);

// 获取联系人列表
const fetchContacts = async () => {
  try {
    const res = await contactsPage({
      ...searchForm,
      page: pagination.page,
      limit: pagination.limit,
      startDate: searchForm.birthdayRange?.[0],
      endDate: searchForm.birthdayRange?.[1]
    });
    contacts.value = res.data;
    total.value = res.total;
  } catch (error) {
    ElMessage.error('加载联系人失败');
  }
};

const resetSearch = () => {
  Object.assign(searchForm, { name: '', phone: '', birthdayRange: [] });
  fetchContacts();
};

const batchDelete = async () => {
  const ids = selectedContacts.value.map((contact) => contact.id).join(',')
  try {
    await contactsDelete(ids)
    fetchContacts();
    ElMessage.success('联系人批量删除成功');
  } catch (error) {
    ElMessage.error('批量删除联系人失败');
  }
};

// 打开添加联系人对话框
const openAddDialog = () => {
  isEditing.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 打开编辑联系人对话框
const openEditDialog = async (contact) => {
  try {
    const data = await contactsGetById(contact.id);
    Object.assign(form, data);
    isEditing.value = true;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('加载联系人信息失败');
  }
};

const addContact = async () => {
  try {
    await contactsAdd(form);
    dialogVisible.value = false;
    fetchContacts();
    ElMessage.success('联系人添加成功');
  } catch (error) {
    ElMessage.error('添加联系人失败');
  }
};

const updateContact = async () => {
  try {
    await contactsUpdate(form);
    dialogVisible.value = false;
    fetchContacts();
    ElMessage.success('联系人更新成功');
  } catch (error) {
    ElMessage.error('更新联系人失败');
  }
};

const deleteContact = async (id) => {
  try {
    await contactsDelete(id);
    fetchContacts();
    ElMessage.success('联系人删除成功');
  } catch (error) {
    ElMessage.error('删除联系人失败');
  }
};

const handleSelectionChange = (val) => {
  selectedContacts.value = val;
};

// 收藏/取消收藏
const toggleFavorite = async (contact) => {
  try {
    if (contact.is_favorite) {
      await contactsUnfavorite(contact.id);
      ElMessage.success('取消收藏成功');
    } else {
      await contactsFavorite(contact.id);
      ElMessage.success('收藏成功');
    }
    // 刷新列表
    fetchContacts();
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

// 下载模板
const downloadTemplate = async () => {
  try {
    const response = await contactsTemplate();
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts_template.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('下载模板失败');
  }
};

// 导入文件
const handleImport = async (options) => {
  const formData = new FormData();
  formData.append('file', options.file);

  try {
    const res = await contactsImport(formData);
    ElMessage.success(`成功导入 ${res.count} 条联系人数据`);
    fetchContacts();
  } catch (error) {
    ElMessage.error('导入失败');
  }
};

// 导出数据
const handleExport = async () => {
  try {
    const response = await contactsExport();
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('导出失败');
  }
};

// 添加分页处理函数
const handlePageChange = (page) => {
  pagination.page = page;
  fetchContacts();
};

// 添加联系方式
const addContactMethod = () => {
  form.contactMethods.push({
    type: 'mobile',
    value: ''
  });
};

// 删除联系方式
const removeContactMethod = (index) => {
  form.contactMethods.splice(index, 1);
};

// 重置表单时也要清空联系方式
const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    phone: '',
    backup_phone: '',
    address: '',
    email: '',
    birthday: '',
    social_media: ''
  });
};

onMounted(() => {
  fetchContacts();
});
</script>

<style scoped>
.contacts-container {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 200px;
  border-right: 1px solid #dcdfe6;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.box-card {
  height: 100%;
}

.table-operations {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.upload-demo {
  display: inline-block;
  margin: 0 10px;
}

.el-divider--vertical {
  margin: 0 10px;
}

.contact-methods {
  margin-top: 20px;
  border-top: 1px solid #dcdfe6;
  padding-top: 20px;
}

.contact-methods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.contact-method-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
