<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <!-- <label class="el-form-item-label">放映厅名称</label> -->
        <el-input v-model="query.hallName" clearable placeholder="输入放映厅名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <!-- <label class="el-form-item-label">电影名称</label> -->
        <el-input v-model="query.movieName" clearable placeholder="输入电影名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <date-range-picker
          v-model="query.beginTime"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          class="date-item"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="120px">
          <el-form-item label="开始放映时间" prop="beginTime">
            <el-date-picker v-model="form.beginTime" type="datetime" style="width: 330px;" />
          </el-form-item>
          <el-form-item label="本场价格" prop="price">
            <el-input v-model="form.price" style="width: 330px;" />
          </el-form-item>
          <el-form-item label="剩余座位数">
            <el-input v-model="form.remain" style="width: 330px;" />
          </el-form-item>
          <el-form-item label="放映厅名称" prop="hall.name">
            <el-select v-model.number="form.hall.hallId" placeholder="请选择" style="width: 330px">
              <el-option v-for="item in halls" :key="item.hallId" :label="item.name" :value="item.hallId" />
            </el-select>
          </el-form-item>
          <el-form-item label="电影名称" prop="movieInfo.name">
            <el-select v-model.number="form.movieInfo.movieInfoId" placeholder="请选择" style="width: 330px">
              <el-option v-for="item in movies" :key="item.movieInfoId" :label="item.name" :value="item.movieInfoId" />
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
        <el-table-column prop="hall.name" label="放映厅名称" />
        <el-table-column prop="movieInfo.name" label="电影名称" />
        <el-table-column prop="beginTime" label="开始放映时间" />
        <el-table-column prop="price" label="本场价格" />
        <el-table-column prop="remain" label="剩余座位数" />
        <el-table-column v-if="checkPer(['admin','schedule:edit','schedule:del'])" label="操作" width="150px" align="center">
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
import crudSchedule from '@/api/cinema/schedule'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = { scheduleId: null, beginTime: null, price: null, remain: null, hall: {hallId: null}, movieInfo:{movieInfoId: null}, createBy: null, updateBy: null, createTime: null, updateTime: null }
export default {
  name: 'Schedule',
  components: { pagination, crudOperation, rrOperation, udOperation, DateRangePicker},
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '排片管理', url: 'api/schedule', idField: 'scheduleId', sort: 'scheduleId,desc', crudMethod: { ...crudSchedule }})
  },
  data() {
    return {
      hallName:'', halls: [], movieName:'', movies: [],
      permission: {
        add: ['admin', 'schedule:add'],
        edit: ['admin', 'schedule:edit'],
        del: ['admin', 'schedule:del']
      },
      rules: {
        scheduleId: [
          { required: true, message: '主键不能为空', trigger: 'blur' }
        ],
        beginTime: [
          { required: true, message: '开始放映时间不能为空', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '本场价格不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'hallName', display_name: '放映厅名称' },
        { key: 'movieName', display_name: '电影名称' },
        { key: 'beginTime', display_name: '放映时间' }
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
      if (!crud.form.hall.hallId) {
        this.$message({
          message: '放映厅不能为空',
          type: 'warning'
        })
        return false
      } else if(!crud.form.movieInfo.movieInfoId) {
        this.$message({
          message: '电影不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },

    initSelect() {
      crudSchedule.getHalls().then(res => {
        this.halls = res.content
      }),
      crudSchedule.getMovies().then(res => {
        this.movies = res.content
      })
    }
  }
}
</script>

<style scoped>

</style>
