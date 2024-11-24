<template>
  <div>
    <el-card class="box-card" header="通讯录管理">
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
          <el-button type="primary" @click="fetchContacts">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 添加按钮 -->
      <div class="table-operations">
        <el-button type="primary" @click="openAddDialog">添加</el-button>
        <el-button type="success" :disabled="selectedContacts.length !== 1"
          @click="openEditDialog(selectedContacts[0])">编辑</el-button>
        <el-button type="danger" :disabled="selectedContacts.length === 0" @click="batchDelete">删除</el-button>
      </div>

      <!-- 联系人列表 -->
      <el-table :data="contacts" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="birthday" label="生日">
          <template #default="scope">
            <span>{{ new Date(scope.row.birthday).toLocaleDateString().replace(/\//g, '-') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="mini" type="primary" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" @click="deleteContact(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination style="margin-top: 20px" background layout="prev, pager, next" :total="total"
        :current-page="pagination.page" :page-size="pagination.limit" @current-change="fetchContacts" />

      <!-- 添加/编辑联系人对话框 -->
      <el-dialog :title="isEditing ? '编辑联系人' : '添加联系人'" v-model="dialogVisible">
        <el-form :model="form" ref="formRef" label-width="80px">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" />
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  contactsPage,
  contactsGetById,
  contactsAdd,
  contactsUpdate,
  contactsDelete
} from '@/api/contacts/index';

// 分页和数据
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

// 添加/编辑对话框
const dialogVisible = ref(false);
const isEditing = ref(false);
const form = reactive({
  id: null,
  name: '',
  phone: '',
  address: '',
  email: '',
  birthday: ''
});
const formRef = ref(null);

const fetchContacts = async () => {
  try {
    const res = await contactsPage({
      ...searchForm,
      page: pagination.page,
      limit: pagination.limit,
      startDate: searchForm.birthdayRange[0],
      endDate: searchForm.birthdayRange[1]
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
  Object.assign(form, { id: null, name: '', phone: '', address: '', email: '', birthday: '' });
  dialogVisible.value = true;
};

// 打开编辑联系人对话框
const openEditDialog = async (contact) => {
  try {
    const data = await contactsGetById(contact.id);
    console.log(data, 'data');

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

onMounted(fetchContacts);
</script>

<style scoped>
.box-card {
  padding: 20px;
}

.table-operations {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 20px;
}
</style>
