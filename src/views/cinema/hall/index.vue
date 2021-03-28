<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <!-- <label class="el-form-item-label">影院名称</label> -->
        <el-input v-model="query.cinemaName" clearable placeholder="输入影院名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <!-- <label class="el-form-item-label">放映厅名称</label> -->
        <el-input v-model="query.name" clearable placeholder="输入放映厅名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <!-- <label class="el-form-item-label">放映厅容量</label> -->
        <el-input v-model="query.capacity" clearable placeholder="输入放映厅容量" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <!-- 搜索 -->
        <el-input v-model="query.type" clearable placeholder="放映厅类型" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="450px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="100px">
          <el-form-item label="放映厅名称" prop="name">
            <el-input v-model="form.name" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="放映厅容量" prop="capacity">
            <el-input v-model="form.capacity" style="width: 300px;" />
          </el-form-item>
          <el-form-item label="放映厅类型">
            <el-select v-model="form.type" filterable placeholder="请选择">
              <el-option
                v-for="item in dict.hall_type"
                :key="item.id"
                :label="item.label"
                :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="电影院名称" prop="cinema.id">
            <el-select v-model.number="form.cinema.cinemaId" placeholder="请选择" style="width: 300px">
              <el-option v-for="item in cinemas" :key="item.cinemaId" :label="item.name" :value="item.cinemaId" />
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="cinema.name" label="影院名称" />
        <el-table-column prop="name" label="放映厅名称" />
        <el-table-column prop="capacity" label="放映厅容量" />
        <el-table-column prop="type" label="放映厅类型">
          <template slot-scope="scope">
            {{ dict.label.hall_type[scope.row.type] }}
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','hall:edit','hall:del'])" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudHall from '@/api/cinema/hall'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { hallId: null, name: null, capacity: null, cinema:{cinemaId: null}, type: null, createBy: null, updateBy: null, createTime: null, updateTime: null }
export default {
  name: 'Hall',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['hall_type'],
  cruds() {
    return CRUD({ title: '放映厅管理', url: 'api/hall', idField: 'hallId', sort: 'hallId,desc', crudMethod: { ...crudHall }})
  },
  data() {
    return {
      cinemaName:'', cinemas: [],
      permission: {
        add: ['admin', 'hall:add'],
        edit: ['admin', 'hall:edit'],
        del: ['admin', 'hall:del']
      },
      rules: {
        hallId: [
          { required: true, message: '主键不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '放映厅名称不能为空', trigger: 'blur' }
        ],
        capacity: [
          { required: true, message: '放映厅容量不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: '放映厅名称' },
        { key: 'capacity', display_name: '放映厅容量' },
        { key: 'cinemaName', display_name: '影院名称' },
        { key: 'type', display_name: '放映厅类型' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 新增编辑前做的操作
    [CRUD.HOOK.beforeToCU](crud, form) {
      this.initSelect()
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud) {
      if (!crud.form.cinema.cinemaId) {
        this.$message({
          message: '电影院不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },

    initSelect() {
      crudHall.getCinemas().then(res => {
        this.cinemas = res.content
      })
    }
  }
}
</script>

<style scoped>

</style>
