<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <!-- <label class="el-form-item-label">放映厅名称</label> -->
        <el-input v-model="query.hallName" clearable placeholder="输入放映厅名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <!-- <label class="el-form-item-label">座位号</label> -->
        <el-input v-model="query.number" clearable placeholder="输入座位号" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <!-- <label class="el-form-item-label">是否损坏</label> -->
        <el-select v-model="query.isDamage" clearable placeholder="是否损坏" style="width: 105px" class="filter-item" @keyup.enter.native="crud.toQuery">
          <el-option label="是" value="true" />
          <el-option label="否" value="false" />
        </el-select>
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="座位号" prop="number">
            <el-input v-model="form.number" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="是否损坏" prop="isDamage">
            <el-radio v-for="item in dict.seat_is_damage" :key="item.id" v-model="form.isDamage" :label="item.value">{{ item.label }}</el-radio>
          </el-form-item>
          <el-form-item label="放映厅名称" prop="hall.hallId">
            <el-select v-model.number="form.hall.hallId" placeholder="请选择" style="width: 370px">
              <el-option v-for="item in halls" :key="item.hallId" :label="item.name" :value="item.hallId" />
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
        <el-table-column prop="number" label="座位号" />
        <el-table-column prop="isDamage" label="是否损坏">
          <template slot-scope="scope">
            {{ dict.label.seat_is_damage[scope.row.isDamage] }}
          </template>
        </el-table-column>
        <el-table-column v-if="checkPer(['admin','seat:edit','seat:del'])" label="操作" width="150px" align="center">
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
import crudSeat from '@/api/cinema/seat'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { seatId: null, number: null, isDamage: null, hall: {hallId: null}, createBy: null, updateBy: null, createTime: null, updateTime: null }
export default {
  name: 'Seat',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  dicts: ['seat_is_damage'],
  cruds() {
    return CRUD({ title: '座位管理', url: 'api/seat', idField: 'seatId', sort: 'seatId,desc', crudMethod: { ...crudSeat }})
  },
  data() {
    return {
      halls:[],
      permission: {
        add: ['admin', 'seat:add'],
        edit: ['admin', 'seat:edit'],
        del: ['admin', 'seat:del']
      },
      rules: {
        seatId: [
          { required: true, message: '主键不能为空', trigger: 'blur' }
        ],
        number: [
          { required: true, message: '座位号不能为空', trigger: 'blur' }
        ],
        isDamage: [
          { required: true, message: '是否损坏不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'number', display_name: '座位号' },
        { key: 'isDamage', display_name: '是否损坏' },
        { key: 'hallName', display_name: '放映厅名称' }
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
      }
      return true
    },

    initSelect() {
      crudSeat.getHalls().then(res => {
        this.halls = res.content
      })
    }
  }
}
</script>

<style scoped>

</style>
